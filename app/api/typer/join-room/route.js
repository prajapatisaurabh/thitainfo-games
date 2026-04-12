import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId } = body;

    if (
      !roomId ||
      typeof roomId !== "string" ||
      !/^[A-Z0-9]{6}$/.test(roomId)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid Room ID" },
        { status: 400 },
      );
    }

    // Connect to database
    const database = await getDB();
    const roomsCollection = database.collection("typer_rooms");

    // Find room
    const room = await roomsCollection.findOne({ roomId });

    if (!room) {
      return NextResponse.json(
        { success: false, message: "Room not found" },
        { status: 404 },
      );
    }

    // Check if room is full
    if (room.players.length >= room.maxPlayers) {
      return NextResponse.json(
        { success: false, message: "Room is full" },
        { status: 400 },
      );
    }

    // Check room status
    if (room.status === "active" || room.status === "finished") {
      return NextResponse.json(
        { success: false, message: "Race has already started or finished" },
        { status: 400 },
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
      },
      { status: 500 },
    );
  }
}
