import express from "express";
import { getRounds, processRound } from "../controllers/roundController.js";
import Race from "../models/Race.js";
import { calculateProgressAndBoost } from "../utils/raceUtils.js";

const router = express.Router();

// Retrieve all rounds for a specific race
router.get("/:raceId", getRounds);

// Manually process a round
router.post("/:raceId/process-round", async (req, res) => {
    try {
        const { raceId } = req.params;
        const race = await Race.findOne({ raceId });

        if (!race) {
            return res.status(404).json({ message: "Race not found" });
        }

        const result = await processRound(race, calculateProgressAndBoost);
        res.status(200).json({ message: "Round processed successfully", result });
    } catch (error) {
        console.error("[ERROR] Failed to process round:", error);
        res.status(500).json({ message: "Failed to process round", error: error.message });
    }
});

router.get("/:raceId/last-round-boosts", async (req, res) => {
    try {
        const { raceId } = req.params;
        const lastRound = await Round.findOne({ raceId })
            .sort({ roundNumber: -1 }) // Get the last round based on roundNumber
            .lean();

        if (!lastRound || !lastRound.progress) {
            return res.status(404).json({ message: "No boost data found for the last round." });
        }

        // Filter only the boosted memes
        const boosts = lastRound.progress
            .filter((entry) => entry.boosted)
            .map((entry) => ({
                memeId: entry.memeId,
                boostAmount: entry.boostAmount,
                boostRound: lastRound.roundNumber, // Important!
            }));

        res.json(boosts);
    } catch (error) {
        console.error("[ERROR] ❌ Failed to fetch last round boosts:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default router;