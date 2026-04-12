const { MongoClient } = require("mongodb");

// Global connection cache for serverless environments
// In Next.js, module-level variables persist between requests in the same instance
let cachedClient = null;
let cachedDb = null;

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "thitainfo_games";

if (!MONGO_URL) {
  console.warn("MONGO_URL environment variable is not set");
}

async function ensureIndexes(db) {
  await Promise.all([
    // typer_rooms: look up by roomId (unique), and by player socketId
    db.collection("typer_rooms").createIndex({ roomId: 1 }, { unique: true }),
    db.collection("typer_rooms").createIndex({ "players.socketId": 1 }),
    db.collection("typer_rooms").createIndex({ status: 1 }),
    db
      .collection("typer_rooms")
      .createIndex({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 }), // TTL: 24h

    // typer_results: sort/filter by date
    db.collection("typer_results").createIndex({ createdAt: -1 }),

    // typer_challenges: look up by challengeId (unique), expire stale challenges
    db
      .collection("typer_challenges")
      .createIndex({ challengeId: 1 }, { unique: true }),
    db
      .collection("typer_challenges")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }), // TTL: uses doc's expiresAt

    // typer_race_results: look up by roomId and challengeId
    db.collection("typer_race_results").createIndex({ roomId: 1 }),
    db.collection("typer_race_results").createIndex({ challengeId: 1 }),
    db.collection("typer_race_results").createIndex({ createdAt: -1 }),
  ]);
}

async function connectDB() {
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

    // Ensure indexes exist (idempotent — safe to call on every cold start)
    await ensureIndexes(db);

    if (process.env.NODE_ENV !== "production") {
      console.log("MongoDB connected successfully");
    }

    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

async function getDB() {
  const { db } = await connectDB();
  return db;
}

// For graceful shutdown
async function closeDB() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("MongoDB connection closed");
  }
}

module.exports = { connectDB, getDB, closeDB };
