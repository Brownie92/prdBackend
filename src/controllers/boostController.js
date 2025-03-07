import mongoose from "mongoose";
import Boost from "../models/Boost.js";
import Vault from "../models/Vault.js";
import { sendBoostUpdate, sendVaultUpdate } from "../socket.js";

export const addBoost = async (req, res) => {
    try {
        let { walletAddress, memeId, raceId, amountSOL, round } = req.body;

        if (!walletAddress || !amountSOL || !round || !raceId || !memeId) {
            return res.status(400).json({ success: false, error: "Missing required fields." });
        }

        if (!mongoose.Types.ObjectId.isValid(memeId)) {
            return res.status(400).json({ success: false, error: "Invalid memeId format" });
        }

        memeId = new mongoose.Types.ObjectId(memeId);

        const newBoost = new Boost({ walletAddress, memeId, raceId, amountSOL, round });
        await newBoost.save();

        console.log(`✅ [BOOST] ${walletAddress} boosted Meme ${memeId} with ${amountSOL} SOL in Round ${round}`);

        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } },
            { upsert: true, new: true }
        );

        console.log(`✅ [VAULT] ${amountSOL} SOL toegevoegd aan Vault voor race ${raceId}`);

        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        sendBoostUpdate({ raceId, round, boosts: boostSummary });
        sendVaultUpdate(updatedVault);

        return res.json({ success: true, boosts: boostSummary, vault: updatedVault });
    } catch (error) {
        console.error("❌ Error processing boost:", error);
        return res.status(500).json({ success: false, error: "Boost processing failed." });
    }
};

export const getBoostsByRace = async (req, res) => {
    console.log("[DEBUG] 🔍 Boost route aangeroepen met params:", req.params);

    try {
        const { raceId, round } = req.params;

        if (!raceId || !round) {
            console.warn("[DEBUG] ❌ Ongeldige request params:", { raceId, round });
            return res.status(400).json({ success: false, error: "Race ID en ronde zijn vereist." });
        }

        console.log(`[API] 🔍 Fetching total boosts for race ${raceId}, round ${round}`);

        const roundNumber = parseInt(round, 10);
        if (isNaN(roundNumber)) {
            console.warn("[DEBUG] ❌ Ongeldige ronde:", round);
            return res.status(400).json({ success: false, error: "Ronde moet een nummer zijn." });
        }

        // ✅ Aggregatie om de totale SOL per memeId te berekenen
        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round: roundNumber } }, // Filter per race en ronde
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } }, // Total SOL per meme
            { $sort: { totalSol: -1 } } // Sorteer van hoog naar laag
        ]);

        if (!boostSummary.length) {
            console.log(`[API] ⚠️ Geen boosts gevonden voor race ${raceId}, ronde ${roundNumber}`);
            return res.status(404).json({ success: false, message: "Geen boosts gevonden." });
        }

        console.log(`[API] ✅ Boosts samengevoegd en gesorteerd: ${boostSummary.length} resultaten`);
        
        // ✅ Transformeer naar een consistent JSON-formaat zoals WebSocket
        const formattedBoosts = boostSummary.map(boost => ({
            memeId: boost._id,
            totalSol: boost.totalSol
        }));

        res.status(200).json({ success: true, boosts: formattedBoosts });
    } catch (error) {
        console.error("❌ Error fetching boosts:", error);
        res.status(500).json({ success: false, error: "Boost ophalen mislukt." });
    }
};
