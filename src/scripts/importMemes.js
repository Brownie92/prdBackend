import mongoose from "mongoose";
import dotenv from "dotenv";
import Meme from "../models/Meme.js"; // Adjust the path if necessary

dotenv.config(); // Load environment variables

const memes = [
  { name: "Bonk", url: "https://coin-images.coingecko.com/coins/images/28600/large/bonk.jpg?1696527587" },
  { name: "dogwifhat", url: "https://coin-images.coingecko.com/coins/images/33566/large/dogwifhat.jpg?1702499428" },
  { name: "Pudgy Penguins", url: "https://coin-images.coingecko.com/coins/images/52622/large/PUDGY_PENGUINS_PENGU_PFP.png?1733809110" },
  { name: "popcat", url: "https://coin-images.coingecko.com/coins/images/33760/large/image.jpg?1702964227" },
  { name: "peanut the squirrel", url: "https://coin-images.coingecko.com/coins/images/51301/large/Peanut_the_Squirrel.png?1734941241" },
  { name: "Moo Deng", url: "https://coin-images.coingecko.com/coins/images/50264/large/MOODENG.jpg?1726726975" },
  { name: "Offical Trump", url: "https://coin-images.coingecko.com/coins/images/53746/large/trump.png?1737171561" },
  { name: "Baby Doge", url: "https://coin-images.coingecko.com/coins/images/16125/large/babydoge.jpg?1696515731" },
  { name: "would", url: "https://coin-images.coingecko.com/coins/images/52316/large/QmXJR6Q2zkqpotTY2nMP6k76LykKW7z4tgfQfH1ZUo57Dt.jpeg?1733076468" },
  { name: "ai16z", url: "https://coin-images.coingecko.com/coins/images/51090/large/AI16Z.jpg?1730027175" },
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