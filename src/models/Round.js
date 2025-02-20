import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, // ✅ The race this round belongs to
    roundNumber: { type: Number, required: true }, // ✅ Round number (1-6)
    progress: [
        {
            memeId: { type: String, required: true }, // ✅ Using String type (consistent with Race & Vote models)
            progress: { type: Number, required: true }, // ✅ Progress value for this round
            boosted: { type: Boolean, default: false }, // ✅ Whether this meme received a boost
            boostAmount: { type: Number, default: 0 } // ✅ Boost amount applied
        }
    ],
    winner: { type: String, required: false }, // ✅ Storing winner as a String for consistency
}, { timestamps: true });

const Round = mongoose.model("Round", roundSchema);
export default Round;