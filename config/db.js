const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in env");
  }

  // If already connected, reuse the connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  console.log("Creating new MongoDB connection...");
  const db = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
  });
  console.log("MongoDB connected");
  return db;
};

module.exports = connectDB;
