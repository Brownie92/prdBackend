import mongoose from "mongoose";

const vaultSchema = new mongoose.Schema({
    raceId: { type: String, required: true, unique: true }, // ✅ Koppeling aan race
    totalSol: { type: Number, default: 0 }, // ✅ Totale ingezette SOL
}, { timestamps: true });

export default mongoose.model("Vault", vaultSchema);