import mongoose from "mongoose";
import Boost from "../models/Boost.js";
import { sendRaceUpdate } from "../socket.js"; // ✅ WebSocket event om boosts live te updaten

export const addBoost = async (req, res) => {
    try {
        let { walletAddress, memeId, raceId, amountSOL, round } = req.body;

        // ✅ Validatie: check alleen ObjectId voor memeId, niet voor raceId
        if (!mongoose.Types.ObjectId.isValid(memeId)) {
            return res.status(400).json({ success: false, error: "Invalid memeId format" });
        }

        // ✅ Converteer alleen memeId naar ObjectId, raceId blijft string
        memeId = new mongoose.Types.ObjectId(memeId);

        // ✅ Extra validatie
        if (!walletAddress || !amountSOL || !round || !raceId) {
            return res.status(400).json({ success: false, error: "Missing required fields." });
        }

        // ✅ Maak een nieuwe boost en sla deze op
        const newBoost = new Boost({ walletAddress, memeId, raceId, amountSOL, round });
        await newBoost.save();

        console.log(`✅ [BOOST] ${walletAddress} boosted Meme ${memeId} with ${amountSOL} SOL in Round ${round}`);

        // ✅ Bereken de totaal ingezette SOL per meme in deze ronde
        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        // ✅ WebSocket event versturen naar de UI
        sendRaceUpdate({ raceId, round, boosts: boostSummary });

        return res.json({ success: true, boosts: boostSummary });
    } catch (error) {
        console.error("❌ Error processing boost:", error);
        return res.status(500).json({ success: false, error: "Boost processing failed." });
    }
};