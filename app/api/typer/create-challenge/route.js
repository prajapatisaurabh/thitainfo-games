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

// Generate unique challenge ID
function generateChallengeId() {
  return `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { challengerId, challengerName, text } = body;

    if (!challengerId || !challengerName) {
      return NextResponse.json(
        { success: false, message: "Challenger ID and name are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const database = await connectDB();
    const challengesCollection = database.collection("typer_challenges");

    // Static typing texts
    const TYPING_TEXTS = [
      "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.",
      "Programming is the art of telling a computer what to do through a series of instructions. It requires logic, creativity, and problem-solving skills.",
      "Technology has transformed the way we live, work, and communicate. From smartphones to artificial intelligence, innovation continues to shape our future.",
      "Practice makes perfect. The more you type, the faster and more accurate you become. Consistency is key to improving your typing skills.",
      "Web development combines creativity with technical skills. Building websites requires knowledge of HTML, CSS, JavaScript, and various frameworks.",
      "The best way to learn programming is by doing. Start with simple projects and gradually work your way up to more complex applications.",
      "Clean code is not written by following a set of rules. You don't become a software craftsman by learning a list of heuristics.",
      "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.",
      "Innovation distinguishes between a leader and a follower. Think different and challenge the status quo.",
      "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    ];

    // Select random text if not provided
    const selectedText =
      text || TYPING_TEXTS[Math.floor(Math.random() * TYPING_TEXTS.length)];

    // Generate challenge ID and link
    const challengeId = generateChallengeId();
    const challengeLink = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/typer/challenge/${challengeId}`;

    // Create challenge
    const challenge = {
      challengeId,
      challengerId,
      challengerName,
      challengeLink,
      status: "pending",
      text: selectedText,
      results: {},
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await challengesCollection.insertOne(challenge);

    return NextResponse.json({
      success: true,
      data: {
        challengeId,
        challengeLink,
        text: selectedText,
      },
    });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating challenge",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

