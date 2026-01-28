import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

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
        error: error.message,
      },
      { status: 500 },
    );
  }
}
