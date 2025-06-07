const mongoose = require("mongoose");

// MongoDB Connection URI from environment variables
const MONGODB_URI =
  "mongodb+srv://dika:jZDl24Ox60X1jtc9@cluster0.8pzz4uz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
