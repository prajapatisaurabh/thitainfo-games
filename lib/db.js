import { MongoClient } from "mongodb";

// Global connection cache for serverless environments
// In Next.js, module-level variables persist between requests in the same instance
let cachedClient = null;
let cachedDb = null;

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "thitainfo_games";

if (!MONGO_URL) {
  console.warn("MONGO_URL environment variable is not set");
}

export async function connectDB() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!MONGO_URL) {
    throw new Error("MONGO_URL environment variable is not set");
  }

  try {
    // Create new client with connection pooling options
    const client = new MongoClient(MONGO_URL, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
    });

    await client.connect();
    const db = client.db(DB_NAME);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    console.log("MongoDB connected successfully");
    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export async function getDB() {
  const { db } = await connectDB();
  return db;
}

// For graceful shutdown
export async function closeDB() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("MongoDB connection closed");
  }
}
