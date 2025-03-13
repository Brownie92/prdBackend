import mongoose from "mongoose";

const raceSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true },
    memes: [
        {
            memeId: { type: String, required: true },
            name: { type: String, required: true },
            url: { type: String, required: true },
            progress: { type: Number, default: 0 },
        }
    ],
    currentRound: { type: Number, default: 1 },
    roundEndTime: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed"], default: "active" },
}, { timestamps: true });

export default mongoose.model("Race", raceSchema);