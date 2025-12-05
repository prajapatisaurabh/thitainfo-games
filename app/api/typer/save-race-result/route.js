import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

let client = null;
let db = null;

const connectDB = async () => {
  if (db) return db;

  try {
    client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    db = client.db(process.env.DB_NAME || "thitainfo_games");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId, players, challengeId } = body;

    if (!roomId || !players || !Array.isArray(players)) {
      return NextResponse.json(
        { success: false, message: "Room ID and players data are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const database = await connectDB();
    const raceResultsCollection = database.collection("typer_race_results");

    // Prepare race result
    const raceResult = {
      roomId,
      challengeId: challengeId || null,
      players: players.map((player) => ({
        username: player.username,
        wpm: player.wpm,
        accuracy: player.accuracy,
        time: player.time,
        errors: player.errors,
        finished: player.finished,
      })),
      finishedAt: new Date(),
      createdAt: new Date(),
    };

    // Save race result
    await raceResultsCollection.insertOne(raceResult);

    // If it's a challenge, update challenge status
    if (challengeId) {
      const challengesCollection = database.collection("typer_challenges");
      await challengesCollection.updateOne(
        { challengeId },
        {
          $set: {
            status: "completed",
            results: {
              challenger:
                players.find((p) => p.socketId === challengeId.split("_")[1]) ||
                {},
              opponent:
                players.find((p) => p.socketId !== challengeId.split("_")[1]) ||
                {},
            },
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Race result saved successfully",
      data: raceResult,
    });
  } catch (error) {
    console.error("Error saving race result:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error saving race result",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

