const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI Loaded:", !!process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
  } catch (error) {
    console.log("========== ERROR ==========");
    console.log(error);
    console.log("===========================");
    process.exit(1);
  }
};

module.exports = connectDB;