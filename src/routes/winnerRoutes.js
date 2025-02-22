import express from "express";
import { saveWinner, getWinnerByRaceId, getLatestWinner } from "../controllers/winnerController.js";

const router = express.Router();

// ✅ Retrieve the latest winner
router.get("/latest", async (req, res) => {
    try {
        const winner = await getLatestWinner();
        if (!winner) {
            return res.status(404).json({ error: "No winner found" });
        }
        res.status(200).json(winner);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch latest winner" });
    }
});

// ✅ Retrieve the winner for a specific race
router.get("/:raceId", async (req, res) => {
    try {
        const winner = await getWinnerByRaceId(req.params.raceId);
        if (!winner) {
            return res.status(404).json({ error: "Winner not found" });
        }
        res.status(200).json(winner);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch winner" });
    }
});

// ✅ Manually force saving the winner for a race
router.post("/:raceId", async (req, res) => {
    try {
        await saveWinner(req.params.raceId);
        res.status(200).json({ message: "Winner successfully saved" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save winner" });
    }
});

export default router;