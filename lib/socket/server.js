const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

let io = null;
let db = null;
let client = null;

// Track active race timers
const raceTimers = new Map(); // roomId -> { timeoutId, graceTimeoutId }
const GRACE_PERIOD_MS = 15000; // 15 seconds grace period after first finisher

// MongoDB connection
const connectDB = async () => {
  if (db) return db;

  try {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db(process.env.DB_NAME || "thitainfo_games");
    console.log("Socket.io: Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Socket.io: MongoDB connection error:", error);
    throw error;
  }
};

// Initialize Socket.io server
function initializeSocketIO(server) {
  if (io) {
    return io;
  }

  io = new Server(server, {
    path: "/api/socket.io",
    addTrailingSlash: false,
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Connect to MongoDB
  connectDB().catch(console.error);

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log(`Socket.io: Client connected: ${socket.id}`);

    // Join room
    socket.on("join-room", async (data) => {
      try {
        const { roomId, username } = data;
        if (!roomId || !username) {
          socket.emit("error", { message: "Room ID and username required" });
          return;
        }

        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Find room
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Check if room is full
        if (room.players.length >= room.maxPlayers) {
          socket.emit("error", { message: "Room is full" });
          return;
        }

        // Check if username already exists in room
        const usernameExists = room.players.some(
          (p) => p.username === username,
        );
        if (usernameExists) {
          socket.emit("error", {
            message: "Username already taken in this room",
          });
          return;
        }

        // Join socket room
        socket.join(roomId);

        // Add player to room
        const player = {
          socketId: socket.id,
          username,
          progress: 0,
          wpm: 0,
          accuracy: 100,
          errors: 0,
          finished: false,
          joinedAt: new Date(),
        };

        await roomsCollection.updateOne(
          { roomId },
          { $push: { players: player } },
        );

        // Get updated room
        const updatedRoom = await roomsCollection.findOne({ roomId });

        // Broadcast room update to all players
        io.to(roomId).emit("room-update", updatedRoom);

        socket.emit("joined-room", { roomId, player });
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", { message: "Error joining room" });
      }
    });

    // Leave room
    socket.on("leave-room", async (data) => {
      try {
        const { roomId } = data;
        if (!roomId) return;

        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Remove player from room
        await roomsCollection.updateOne(
          { roomId },
          { $pull: { players: { socketId: socket.id } } },
        );

        // Get updated room
        const updatedRoom = await roomsCollection.findOne({ roomId });

        // Leave socket room
        socket.leave(roomId);

        // Broadcast room update
        if (updatedRoom) {
          io.to(roomId).emit("room-update", updatedRoom);
        }
      } catch (error) {
        console.error("Error leaving room:", error);
      }
    });

    // Player progress update
    socket.on("player-progress", async (data) => {
      try {
        const { roomId, progress, wpm, accuracy, errors, finished } = data;
        if (!roomId) return;

        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Get current room state before update
        const room = await roomsCollection.findOne({ roomId });
        if (!room) return;

        // Don't set finished flag here - let player-finished handle it properly
        // This prevents race condition where player-progress sets finished before player-finished
        await roomsCollection.updateOne(
          { roomId, "players.socketId": socket.id },
          {
            $set: {
              "players.$.progress": progress,
              "players.$.wpm": wpm,
              "players.$.accuracy": accuracy,
              "players.$.errors": errors,
              // Only update finished if not already finished (to preserve finishedAt timestamp)
              ...(finished &&
              !room.players.find((p) => p.socketId === socket.id)?.finished
                ? { "players.$.finished": true }
                : {}),
            },
          },
        );

        // Get updated room
        const updatedRoom = await roomsCollection.findOne({ roomId });
        if (updatedRoom) {
          // Broadcast to all players in room
          io.to(roomId).emit("room-update", updatedRoom);
        }
      } catch (error) {
        console.error("Error updating player progress:", error);
      }
    });

    // Player finished the race
    socket.on("player-finished", async (data) => {
      try {
        const { roomId, wpm, accuracy, errors, time } = data;
        if (!roomId) return;

        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Get the room
        const room = await roomsCollection.findOne({ roomId });
        if (!room) return;

        // Check if race is already finished
        const isRaceAlreadyFinished = room.status === "finished";

        // Update player's finished status with time and set progress to 100%
        await roomsCollection.updateOne(
          { roomId, "players.socketId": socket.id },
          {
            $set: {
              "players.$.finished": true,
              "players.$.finishedAt": new Date(),
              "players.$.wpm": wpm,
              "players.$.accuracy": accuracy,
              "players.$.errors": errors,
              "players.$.time": time,
              "players.$.progress": 100,
            },
          },
        );

        // Get updated room with all player data
        const updatedRoom = await roomsCollection.findOne({ roomId });

        // If race is already finished, update all players with new data
        if (isRaceAlreadyFinished) {
          // Broadcast updated results to all players so they see latest stats
          io.to(roomId).emit("room-update", updatedRoom);
          return;
        }

        // Check if this is the first finisher
        const isFirstFinisher =
          !room.firstFinisherId && room.status === "active";

        if (isFirstFinisher) {
          const graceEndTime = new Date(Date.now() + GRACE_PERIOD_MS);

          // Mark first finisher and start grace period
          await roomsCollection.updateOne(
            { roomId },
            {
              $set: {
                firstFinisherId: socket.id,
                firstFinisherTime: time,
                graceEndTime,
              },
            },
          );

          const finisherPlayer = updatedRoom.players.find(
            (p) => p.socketId === socket.id,
          );

          // Notify all players about first finisher and grace period
          io.to(roomId).emit("first-player-finished", {
            finisherId: socket.id,
            finisherName: finisherPlayer?.username,
            graceEndTime,
            gracePeriodSeconds: 15,
          });

          // Clear existing race timeout and set grace period timeout
          const timers = raceTimers.get(roomId);
          if (timers?.timeoutId) {
            clearTimeout(timers.timeoutId);
          }

          const graceTimeoutId = setTimeout(() => {
            endRaceByGracePeriod(roomId, socket.id);
          }, GRACE_PERIOD_MS);

          raceTimers.set(roomId, {
            timeoutId: null,
            graceTimeoutId,
          });

          console.log(
            `First finisher in room ${roomId}: ${finisherPlayer?.username}`,
          );
        }

        // Check if all players finished
        const allFinished = updatedRoom.players.every((p) => p.finished);
        if (allFinished) {
          // Clear grace period timer if set
          const timers = raceTimers.get(roomId);
          if (timers?.graceTimeoutId) {
            clearTimeout(timers.graceTimeoutId);
            raceTimers.delete(roomId);
          }

          // End race immediately
          const winner =
            updatedRoom.players.find(
              (p) => p.socketId === room.firstFinisherId,
            ) || updatedRoom.players.find((p) => p.finished);

          await roomsCollection.updateOne(
            { roomId },
            {
              $set: {
                status: "finished",
                finishedAt: new Date(),
                winnerId: room.firstFinisherId || socket.id,
                winnerName: winner?.username,
              },
            },
          );

          const finalRoom = await roomsCollection.findOne({ roomId });

          io.to(roomId).emit("race-finished", {
            results: finalRoom.players,
            winner: winner
              ? {
                  socketId: winner.socketId,
                  username: winner.username,
                  wpm: winner.wpm,
                  accuracy: winner.accuracy,
                  errors: winner.errors,
                  time: winner.time,
                }
              : null,
            roomId,
          });

          // Save race result
          const raceResultsCollection =
            database.collection("typer_race_results");
          await raceResultsCollection.insertOne({
            roomId,
            players: finalRoom.players,
            winnerId: room.firstFinisherId || socket.id,
            winnerName: winner?.username,
            winnerWpm: winner?.wpm || 0,
            winnerAccuracy: winner?.accuracy || 0,
            finishedAt: new Date(),
          });

          console.log(`Race ${roomId} ended - all players finished`);
        } else {
          // Broadcast room update so other players see progress
          io.to(roomId).emit("room-update", updatedRoom);
        }
      } catch (error) {
        console.error("Error handling player finish:", error);
      }
    });

    // Start race (host only)
    socket.on("start-race", async (data) => {
      try {
        const { roomId } = data;
        if (!roomId) return;

        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Get room
        const room = await roomsCollection.findOne({ roomId });
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Check if user is host
        if (room.hostId !== socket.id) {
          socket.emit("error", { message: "Only host can start the race" });
          return;
        }

        // Update room status to starting
        await roomsCollection.updateOne(
          { roomId },
          { $set: { status: "starting" } },
        );

        // Start countdown
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          io.to(roomId).emit("race-countdown", { countdown });
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);
            // Start race
            const startedAt = new Date();
            roomsCollection
              .updateOne(
                { roomId },
                {
                  $set: {
                    status: "active",
                    startedAt,
                  },
                },
              )
              .then(async () => {
                // Get updated room with calculatedDuration
                const updatedRoom = await roomsCollection.findOne({ roomId });
                const raceDuration = updatedRoom.calculatedDuration || 120; // Default 2 min

                // Send race started with duration info
                io.to(roomId).emit("race-started", {
                  startedAt,
                  raceDuration,
                  timerMode: updatedRoom.timerMode,
                });

                // Set server-side race timeout
                const timeoutId = setTimeout(() => {
                  endRaceByTimeout(roomId);
                }, raceDuration * 1000);

                raceTimers.set(roomId, { timeoutId, graceTimeoutId: null });
                console.log(
                  `Race ${roomId} started with ${raceDuration}s timeout`,
                );
              });
          }
        }, 1000);
      } catch (error) {
        console.error("Error starting race:", error);
        socket.emit("error", { message: "Error starting race" });
      }
    });

    // Challenge events
    socket.on("accept-challenge", async (data) => {
      try {
        const { challengeId, username } = data;
        if (!challengeId || !username) return;

        const database = await connectDB();
        const challengesCollection = database.collection("typer_challenges");

        // Get challenge
        const challenge = await challengesCollection.findOne({ challengeId });
        if (!challenge) {
          socket.emit("error", { message: "Challenge not found" });
          return;
        }

        // Update challenge
        await challengesCollection.updateOne(
          { challengeId },
          {
            $set: {
              status: "accepted",
              opponentId: socket.id,
              opponentName: username,
            },
          },
        );

        // Create race room for challenge
        const roomsCollection = database.collection("typer_rooms");
        const roomId = `challenge_${challengeId}`;
        const room = {
          roomId,
          hostId: challenge.challengerId,
          players: [],
          text: challenge.text,
          status: "waiting",
          createdAt: new Date(),
          maxPlayers: 2,
          challengeId,
        };

        await roomsCollection.insertOne(room);

        // Notify both players
        io.to(challenge.challengerId).emit("challenge-accepted", {
          challengeId,
          roomId,
        });
        socket.emit("challenge-accepted", { challengeId, roomId });
      } catch (error) {
        console.error("Error accepting challenge:", error);
        socket.emit("error", { message: "Error accepting challenge" });
      }
    });

    // Disconnect handling
    socket.on("disconnect", async () => {
      console.log(`Socket.io: Client disconnected: ${socket.id}`);

      try {
        const database = await connectDB();
        const roomsCollection = database.collection("typer_rooms");

        // Remove player from all rooms
        await roomsCollection.updateMany(
          {},
          { $pull: { players: { socketId: socket.id } } },
        );

        // Find rooms where this player was
        const rooms = await roomsCollection
          .find({ "players.socketId": socket.id })
          .toArray();

        // Broadcast updates to those rooms
        for (const room of rooms) {
          const updatedRoom = await roomsCollection.findOne({
            roomId: room.roomId,
          });
          if (updatedRoom) {
            io.to(room.roomId).emit("room-update", updatedRoom);
          }
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

  return io;
}

// Get Socket.io instance
function getSocketIO() {
  return io;
}

// Helper function to end race by timeout
async function endRaceByTimeout(roomId) {
  try {
    const database = await connectDB();
    const roomsCollection = database.collection("typer_rooms");

    const room = await roomsCollection.findOne({ roomId });
    if (!room || room.status === "finished") return;

    // Clear any existing timers
    const timers = raceTimers.get(roomId);
    if (timers) {
      if (timers.timeoutId) clearTimeout(timers.timeoutId);
      if (timers.graceTimeoutId) clearTimeout(timers.graceTimeoutId);
      raceTimers.delete(roomId);
    }

    // Determine winner (first finished player, or highest progress)
    const sortedPlayers = [...(room.players || [])].sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      if (a.finished && b.finished) {
        return (a.time || Infinity) - (b.time || Infinity);
      }
      return (b.progress || 0) - (a.progress || 0);
    });

    const winner = sortedPlayers[0];

    await roomsCollection.updateOne(
      { roomId },
      {
        $set: {
          status: "finished",
          finishedAt: new Date(),
          winnerId: winner?.socketId || null,
          winnerName: winner?.username || null,
          finishedByTimeout: true,
        },
      },
    );

    // Get final room state
    const finalRoom = await roomsCollection.findOne({ roomId });

    io.to(roomId).emit("race-finished", {
      results: finalRoom.players,
      winner: winner
        ? {
            socketId: winner.socketId,
            username: winner.username,
            wpm: winner.wpm,
            accuracy: winner.accuracy,
            errors: winner.errors,
            time: winner.time,
            finished: winner.finished,
          }
        : null,
      roomId,
      finishedByTimeout: true,
    });

    // Save race result
    const raceResultsCollection = database.collection("typer_race_results");
    await raceResultsCollection.insertOne({
      roomId,
      players: finalRoom.players,
      winnerId: winner?.socketId || null,
      winnerName: winner?.username || null,
      winnerWpm: winner?.wpm || 0,
      winnerAccuracy: winner?.accuracy || 0,
      finishedAt: new Date(),
      finishedByTimeout: true,
    });

    console.log(`Race ${roomId} ended by timeout`);
  } catch (error) {
    console.error("Error ending race by timeout:", error);
  }
}

// Helper function to end race by grace period
async function endRaceByGracePeriod(roomId, firstFinisherId) {
  try {
    const database = await connectDB();
    const roomsCollection = database.collection("typer_rooms");

    const room = await roomsCollection.findOne({ roomId });
    if (!room || room.status === "finished") return;

    // Clear timers
    const timers = raceTimers.get(roomId);
    if (timers) {
      raceTimers.delete(roomId);
    }

    const winner = room.players.find((p) => p.socketId === firstFinisherId);

    await roomsCollection.updateOne(
      { roomId },
      {
        $set: {
          status: "finished",
          finishedAt: new Date(),
          winnerId: firstFinisherId,
          winnerName: winner?.username,
        },
      },
    );

    const finalRoom = await roomsCollection.findOne({ roomId });

    io.to(roomId).emit("race-finished", {
      results: finalRoom.players,
      winner: winner
        ? {
            socketId: winner.socketId,
            username: winner.username,
            wpm: winner.wpm,
            accuracy: winner.accuracy,
            errors: winner.errors,
            time: winner.time,
          }
        : null,
      roomId,
      gracePeriodEnded: true,
    });

    // Save race result
    const raceResultsCollection = database.collection("typer_race_results");
    await raceResultsCollection.insertOne({
      roomId,
      players: finalRoom.players,
      winnerId: firstFinisherId,
      winnerName: winner?.username,
      winnerWpm: winner?.wpm || 0,
      winnerAccuracy: winner?.accuracy || 0,
      finishedAt: new Date(),
      gracePeriodEnded: true,
    });

    console.log(`Race ${roomId} ended by grace period`);
  } catch (error) {
    console.error("Error ending race by grace period:", error);
  }
}

module.exports = { initializeSocketIO, getSocketIO };
