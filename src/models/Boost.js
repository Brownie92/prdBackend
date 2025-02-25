import mongoose from "mongoose";

const BoostSchema = new mongoose.Schema({
    walletAddress: { type: String, required: true }, // ✅ Wallet van de gebruiker
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: "Meme", required: true }, // ✅ Meme die geboost wordt
    raceId: { type: String, required: true },
    amountSOL: { type: Number, required: true }, // ✅ Ingezette hoeveelheid SOL
    round: { type: Number, required: true }, // ✅ Welke ronde deze boost plaatsvond
    timestamp: { type: Date, default: Date.now } // ✅ Tijdstip van de boost
});

const Boost = mongoose.model("Boost", BoostSchema);
export default Boost;