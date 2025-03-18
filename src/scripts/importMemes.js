import mongoose from "mongoose";
import dotenv from "dotenv";
import Meme from "../models/Meme.js"; // Adjust the path if necessary

dotenv.config(); // Load environment variables

const memes = [
  { name: "example", url: "" },
];

const importMemes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected to MongoDB");

    // Clear existing memes to prevent duplicates
    await Meme.deleteMany();

    // Insert new memes
    const insertedMemes = await Meme.insertMany(memes);

    console.log(`✅ Successfully inserted ${insertedMemes.length} memes`);
    process.exit();
  } catch (error) {
    console.error("❌ Error importing memes:", error);
    process.exit(1);
  }
};

importMemes();