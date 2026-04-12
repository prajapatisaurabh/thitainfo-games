import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getRandomText, calculateTimerFromText } from "@/lib/constants";
import { rateLimit } from "@/lib/rate-limit";

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
  const limited = rateLimit(request, { limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const {
      hostId,
      text,
      maxPlayers = 10,
      timerMode = "text-based",
      timerDuration = 120,
    } = body;

    if (!hostId || typeof hostId !== "string" || hostId.length > 100) {
      return NextResponse.json(
        { success: false, message: "Host ID is required" },
        { status: 400 },
      );
    }

    const parsedMaxPlayers = parseInt(maxPlayers);
    if (
      isNaN(parsedMaxPlayers) ||
      parsedMaxPlayers < 2 ||
      parsedMaxPlayers > 20
    ) {
      return NextResponse.json(
        { success: false, message: "maxPlayers must be between 2 and 20" },
        { status: 400 },
      );
    }

    const validTimerModes = ["text-based", "fixed"];
    if (!validTimerModes.includes(timerMode)) {
      return NextResponse.json(
        { success: false, message: "Invalid timerMode" },
        { status: 400 },
      );
    }

    const parsedDuration = parseInt(timerDuration);
    if (isNaN(parsedDuration) || parsedDuration < 30 || parsedDuration > 3600) {
      return NextResponse.json(
        {
          success: false,
          message: "timerDuration must be between 30 and 3600 seconds",
        },
        { status: 400 },
      );
    }

    if (
      text !== undefined &&
      (typeof text !== "string" || text.length > 2000)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid text" },
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
        : parsedDuration;

    // Create room
    const room = {
      roomId,
      hostId,
      players: [],
      text: selectedText,
      status: "waiting",
      createdAt: new Date(),
      maxPlayers: parsedMaxPlayers,
      timerMode,
      timerDuration: timerMode === "fixed" ? parsedDuration : null,
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
      },
      { status: 500 },
    );
  }
}
