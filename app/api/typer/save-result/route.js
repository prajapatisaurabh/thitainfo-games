import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request) {
  const limited = rateLimit(request, { limit: 30, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json();
    const { wpm, accuracy, time, errors, date } = body;

    // Validate required fields
    if (
      typeof wpm !== "number" ||
      wpm < 0 ||
      wpm > 500 ||
      typeof accuracy !== "number" ||
      accuracy < 0 ||
      accuracy > 100 ||
      typeof time !== "number" ||
      time <= 0 ||
      time > 3600
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid data format" },
        { status: 400 },
      );
    }

    if (
      errors !== undefined &&
      (typeof errors !== "number" || errors < 0 || errors > 10000)
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid errors value" },
        { status: 400 },
      );
    }

    // Connect to database
    const database = await getDB();
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
      },
      { status: 500 },
    );
  }
}
