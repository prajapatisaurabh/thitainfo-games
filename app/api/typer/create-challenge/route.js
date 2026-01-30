import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { getRandomText } from "@/lib/constants";

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
        { status: 400 },
      );
    }

    // Connect to database
    const database = await getDB();
    const challengesCollection = database.collection("typer_challenges");

    // Select random text if not provided
    const selectedText = text || getRandomText();

    // Generate challenge ID and link
    const challengeId = generateChallengeId();

    // Get base URL from request headers or env variable
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const challengeLink = `${baseUrl}/typer/challenge/${challengeId}`;

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
      { status: 500 },
    );
  }
}
