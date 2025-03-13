import mongoose from "mongoose";

const BoostSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true }, 
    memeId: { type: String, required: true }, 
    raceId: { type: String, required: true },
    amountSOL: { type: Number, required: true }, 
    round: { type: Number, required: true }, 
    timestamp: { type: Date, default: Date.now } 
});

const Boost = mongoose.model("Boost", BoostSchema);
export default Boost;