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

export async function GET(request, { params }) {
  try {
    const { roomId } = params;

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "Room ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const database = await connectDB();
    const roomsCollection = database.collection("typer_rooms");

    // Find room
    const room = await roomsCollection.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching room",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

