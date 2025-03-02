import mongoose from "mongoose";
import Boost from "../models/Boost.js";
import Vault from "../models/Vault.js"; // ✅ Import Vault model
import { sendBoostUpdate, sendVaultUpdate } from "../socket.js"; // ✅ WebSocket voor live updates

export const addBoost = async (req, res) => {
    try {
        let { walletAddress, memeId, raceId, amountSOL, round } = req.body;

        // ✅ Validatie van vereiste velden
        if (!walletAddress || !amountSOL || !round || !raceId || !memeId) {
            return res.status(400).json({ success: false, error: "Missing required fields." });
        }

        // ✅ Controleer of memeId een geldig ObjectId is
        if (!mongoose.Types.ObjectId.isValid(memeId)) {
            return res.status(400).json({ success: false, error: "Invalid memeId format" });
        }

        // ✅ Converteer memeId naar ObjectId voor MongoDB
        memeId = new mongoose.Types.ObjectId(memeId);

        // ✅ Maak een nieuwe boost aan en sla op in de database
        const newBoost = new Boost({ walletAddress, memeId, raceId, amountSOL, round });
        await newBoost.save();

        console.log(`✅ [BOOST] ${walletAddress} boosted Meme ${memeId} with ${amountSOL} SOL in Round ${round}`);

        // ✅ Update The Vault met de nieuwe boost-inzet
        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } }, // ✅ Voeg SOL toe aan The Vault
            { upsert: true, new: true }
        );

        console.log(`✅ [VAULT] ${amountSOL} SOL toegevoegd aan Vault voor race ${raceId}`);

        // ✅ Bereken de totaal ingezette SOL per meme in deze ronde
        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        // ✅ WebSocket event versturen naar de UI voor live updates
        sendBoostUpdate({ raceId, round, boosts: boostSummary });
        sendVaultUpdate(updatedVault); // ✅ WebSocket event voor Vault update

        return res.json({ success: true, boosts: boostSummary, vault: updatedVault });
    } catch (error) {
        console.error("❌ Error processing boost:", error);
        return res.status(500).json({ success: false, error: "Boost processing failed." });
    }
};