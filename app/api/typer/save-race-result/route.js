import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId, players, challengeId } = body;

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

    if (
      !Array.isArray(players) ||
      players.length === 0 ||
      players.length > 20
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid players data" },
        { status: 400 },
      );
    }

    for (const p of players) {
      if (
        typeof p.username !== "string" ||
        p.username.length === 0 ||
        p.username.length > 50 ||
        (p.wpm !== undefined &&
          (typeof p.wpm !== "number" || p.wpm < 0 || p.wpm > 500)) ||
        (p.accuracy !== undefined &&
          (typeof p.accuracy !== "number" ||
            p.accuracy < 0 ||
            p.accuracy > 100))
      ) {
        return NextResponse.json(
          { success: false, message: "Invalid player data" },
          { status: 400 },
        );
      }
    }

    // Connect to database
    const database = await getDB();
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
        },
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
      },
      { status: 500 },
    );
  }
}
