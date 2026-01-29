import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getRandomText, calculateTimerFromText } from "@/lib/constants";

// Generate random room code
function generateRoomCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      hostId,
      text,
      maxPlayers = 10,
      timerMode = "text-based",
      timerDuration = 120,
    } = body;

    if (!hostId) {
      return NextResponse.json(
        { success: false, message: "Host ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    const database = await getDB();
    const roomsCollection = database.collection("typer_rooms");

    // Generate unique room code
    let roomId;
    let isUnique = false;
    while (!isUnique) {
      roomId = generateRoomCode();
      const existingRoom = await roomsCollection.findOne({ roomId });
      if (!existingRoom) {
        isUnique = true;
      }
    }

    // Select random text if not provided
    const selectedText = text || getRandomText();

    // Calculate race duration based on timer mode
    const calculatedDuration =
      timerMode === "text-based"
        ? calculateTimerFromText(selectedText)
        : parseInt(timerDuration) || 120;

    // Create room
    const room = {
      roomId,
      hostId,
      players: [],
      text: selectedText,
      status: "waiting",
      createdAt: new Date(),
      maxPlayers: parseInt(maxPlayers) || 10,
      timerMode,
      timerDuration: timerMode === "fixed" ? parseInt(timerDuration) : null,
      calculatedDuration,
      graceEndTime: null,
      firstFinisherId: null,
      firstFinisherTime: null,
    };

    await roomsCollection.insertOne(room);

    return NextResponse.json({
      success: true,
      data: {
        roomId,
        text: selectedText,
        maxPlayers: room.maxPlayers,
        timerMode: room.timerMode,
        timerDuration: room.timerDuration,
        calculatedDuration: room.calculatedDuration,
      },
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error creating room",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
