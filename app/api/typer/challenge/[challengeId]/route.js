import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const { challengeId } = params;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, message: "Challenge ID is required" },
        { status: 400 },
      );
    }

    // Connect to database
    const database = await getDB();
    const challengesCollection = database.collection("typer_challenges");

    // Find challenge
    const challenge = await challengesCollection.findOne({ challengeId });

    if (!challenge) {
      return NextResponse.json(
        { success: false, message: "Challenge not found" },
        { status: 404 },
      );
    }

    // Check if challenge has expired
    if (new Date() > new Date(challenge.expiresAt)) {
      return NextResponse.json(
        { success: false, message: "Challenge has expired" },
        { status: 400 },
      );
    }

    // Check if challenge is already completed
    if (challenge.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Challenge has already been completed" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        challengeId: challenge.challengeId,
        challengerName: challenge.challengerName,
        text: challenge.text,
        status: challenge.status,
        createdAt: challenge.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching challenge",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
