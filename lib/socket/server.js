const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");

let io = null;
let db = null;
let client = null;

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
          (p) => p.username === username
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
          { $push: { players: player } }
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
          { $pull: { players: { socketId: socket.id } } }
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

        // Update player progress
        await roomsCollection.updateOne(
          { roomId, "players.socketId": socket.id },
          {
            $set: {
              "players.$.progress": progress,
              "players.$.wpm": wpm,
              "players.$.accuracy": accuracy,
              "players.$.errors": errors,
              "players.$.finished": finished,
            },
          }
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

        // Check if race is already finished - only first finisher wins
        const isRaceAlreadyFinished = room.status === "finished";

        // Update player's finished status with time
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
            },
          }
        );

        // If race is already finished, just update the player and notify
        if (isRaceAlreadyFinished) {
          const updatedRoom = await roomsCollection.findOne({ roomId });
          io.to(roomId).emit("room-update", updatedRoom);
          return;
        }

        // Get updated room
        const updatedRoom = await roomsCollection.findOne({ roomId });
        
        // Find the winner (this player who just finished first)
        const winner = updatedRoom.players.find(p => p.socketId === socket.id);

        // Update room status to finished
        await roomsCollection.updateOne(
          { roomId },
          {
            $set: {
              status: "finished",
              finishedAt: new Date(),
              winnerId: socket.id,
            },
          }
        );

        // Broadcast race finished to ALL players with final results
        io.to(roomId).emit("race-finished", {
          results: updatedRoom.players,
          winner: winner,
          roomId,
        });

        // Save race result
        const raceResultsCollection = database.collection("typer_race_results");
        await raceResultsCollection.insertOne({
          roomId,
          players: updatedRoom.players,
          winnerId: socket.id,
          winnerName: winner?.username,
          finishedAt: new Date(),
        });

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
          { $set: { status: "starting" } }
        );

        // Start countdown
        let countdown = 3;
        const countdownInterval = setInterval(() => {
          io.to(roomId).emit("race-countdown", { countdown });
          countdown--;

          if (countdown < 0) {
            clearInterval(countdownInterval);
            // Start race
            roomsCollection
              .updateOne(
                { roomId },
                {
                  $set: {
                    status: "active",
                    startedAt: new Date(),
                  },
                }
              )
              .then(() => {
                io.to(roomId).emit("race-started", { startedAt: new Date() });
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
          }
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
          { $pull: { players: { socketId: socket.id } } }
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

module.exports = { initializeSocketIO, getSocketIO };

