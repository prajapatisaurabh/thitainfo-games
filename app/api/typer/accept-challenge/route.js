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
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, message: "Challenge ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const database = await connectDB();
    const challengesCollection = database.collection("typer_challenges");

    // Find challenge
    const challenge = await challengesCollection.findOne({ challengeId });

    if (!challenge) {
      return NextResponse.json(
        { success: false, message: "Challenge not found" },
        { status: 404 }
      );
    }

    // Check if challenge has expired
    if (new Date() > new Date(challenge.expiresAt)) {
      return NextResponse.json(
        { success: false, message: "Challenge has expired" },
        { status: 400 }
      );
    }

    // Check if challenge is already accepted
    if (challenge.status === "accepted" || challenge.status === "active") {
      return NextResponse.json(
        { success: false, message: "Challenge has already been accepted" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Challenge is valid and ready to be accepted",
      data: {
        challengeId: challenge.challengeId,
        text: challenge.text,
        challengerName: challenge.challengerName,
      },
    });
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error accepting challenge",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

