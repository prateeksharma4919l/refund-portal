import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is required");
  }

  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    process.env.USE_MEMORY_DB = "false";
    return true;
  } catch (error) {
    process.env.USE_MEMORY_DB = "true";
    console.warn("MongoDB unavailable. Using in-memory development store.");
    return false;
  }
}
