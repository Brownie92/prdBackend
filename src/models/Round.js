import mongoose from "mongoose";

const roundSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, 
    roundNumber: { type: Number, required: true }, 
    progress: [
        {
            memeId: { type: String, required: true }, 
            progress: { type: Number, required: true }, 
            boosted: { type: Boolean, default: false }, 
            boostAmount: { type: Number, default: 0 } 
        }
    ],
    winner: { type: String, required: false },
}, { timestamps: true });

const Round = mongoose.model("Round", roundSchema);
export default Round;