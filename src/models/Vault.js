import mongoose from "mongoose";

const vaultSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true }, 
    totalSol: { type: Number, default: 0 }, 
}, { timestamps: true });

export default mongoose.model("Vault", vaultSchema);