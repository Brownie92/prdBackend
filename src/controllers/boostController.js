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

        const newBoost = new Boost({ walletAddress, memeId, raceId, amountSOL, round });
        await newBoost.save();

        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } },
            { upsert: true, new: true }
        );

        // Aggregate boosts for the current round and race
        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        // Format boost data
        const formattedBoosts = boostSummary.map(boost => ({
            memeId: boost._id.toString(), // Convert ObjectId to string
            totalSol: boost.totalSol
        }));

        sendBoostUpdate({ raceId, round, boosts: formattedBoosts });
        sendVaultUpdate(updatedVault);

        return res.json({ success: true, boosts: formattedBoosts, vault: updatedVault });
    } catch (error) {
        return res.status(500).json({ success: false, error: "Boost processing failed." });
    }
};

export const getBoostsByRace = async (req, res) => {
    try {
        const { raceId, round } = req.params;

        if (!raceId || !round) {
            return res.status(400).json({ success: false, error: "Race ID and round are required." });
        }

        const roundNumber = parseInt(round, 10);
        if (isNaN(roundNumber)) {
            return res.status(400).json({ success: false, error: "Round must be a number." });
        }

        // Aggregate boosts for the requested race and round
        const boostSummary = await Boost.aggregate([
            { $match: { raceId, round: roundNumber } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        if (!boostSummary.length) {
            return res.status(404).json({ success: false, message: "No boosts found." });
        }

        // Format boost data
        const formattedBoosts = boostSummary.map(boost => ({
            memeId: boost._id.toString(), // Convert ObjectId to string
            totalSol: boost.totalSol
        }));

        res.status(200).json({ success: true, boosts: formattedBoosts });
    } catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch boosts." });
    }
};
