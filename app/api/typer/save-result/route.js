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
    const { wpm, accuracy, time, errors, date } = body;

    // Validate required fields
    if (
      typeof wpm !== "number" ||
      typeof accuracy !== "number" ||
      typeof time !== "number"
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid data format" },
        { status: 400 }
      );
    }

    // Connect to database
    const database = await connectDB();
    const collection = database.collection("typer_results");

    // Prepare result document
    const result = {
      wpm,
      accuracy,
      time,
      errors,
      date: date || new Date().toISOString(),
      createdAt: new Date(),
    };

    // Insert result
    await collection.insertOne(result);

    return NextResponse.json({
      success: true,
      message: "Result saved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error saving typer result:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error saving result",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

