import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Force dynamic rendering since we access searchParams
export const dynamic = "force-dynamic";

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

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    // Connect to database
    const database = await connectDB();
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
        error: error.message,
      },
      { status: 500 }
    );
  }
}

