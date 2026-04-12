import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

// Force dynamic rendering since we access searchParams
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawLimit = parseInt(searchParams.get("limit") || "10");
    const limit =
      isNaN(rawLimit) || rawLimit < 1 ? 10 : Math.min(rawLimit, 100);

    // Connect to database
    const database = await getDB();
    const collection = database.collection("typer_results");

    // Get recent results, sorted by date (newest first)
    const results = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    console.error("Error fetching typer history:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching history",
      },
      { status: 500 },
    );
  }
}
