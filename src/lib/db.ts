import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || "crisis-corner";

if (!uri) throw new Error("❌ Missing MONGODB_URI in environment variables.");

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as { _mongoose?: CachedConnection })._mongoose;

if (!cached) {
  cached = (global as { _mongoose?: CachedConnection })._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    cached!.promise = mongoose.connect(uri, { dbName }).then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
