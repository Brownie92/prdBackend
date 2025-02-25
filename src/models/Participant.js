import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true },
    walletAddress: { type: String, required: true, index: true },
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: "Meme", required: true },
    amountSOL: { type: Number, required: true, default: 0.2 },
    createdAt: { type: Date, default: Date.now },
});

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;