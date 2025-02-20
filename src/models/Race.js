import mongoose from "mongoose";

const raceSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true }, // ✅ Unique ID for the race
    memes: [
        {
            memeId: { type: String, required: true }, // ✅ Unique identifier for each meme
            name: { type: String, required: true }, // ✅ Meme name
            url: { type: String, required: true }, // ✅ Meme image URL
            progress: { type: Number, default: 0 }, // ✅ Progress in the race
        }
    ],
    currentRound: { type: Number, default: 1 }, // ✅ Current round (1 to 6)
    roundEndTime: { type: Date, required: true }, // ✅ Timestamp when the round ends
    status: { type: String, enum: ["active", "closed"], default: "active" }, // ✅ Race status
}, { timestamps: true });

export default mongoose.model("Race", raceSchema);