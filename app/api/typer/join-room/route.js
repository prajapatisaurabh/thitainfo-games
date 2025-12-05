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
    const { roomId } = body;

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

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { success: false, message: "Room is full" },
        { status: 400 }
      );
    }

    // Check room status
    if (room.status === "active" || room.status === "finished") {
      return NextResponse.json(
        { success: false, message: "Race has already started or finished" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        roomId: room.roomId,
        text: room.text,
        players: room.players.length,
        maxPlayers: room.maxPlayers,
        status: room.status,
      },
    });
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error joining room",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

