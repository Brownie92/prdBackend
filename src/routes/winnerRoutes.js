import express from "express";
import { saveWinner, getWinnerByRaceId, getAllWinners, getLatestWinner } from "../controllers/winnerController.js";

const router = express.Router();

// Retrieve all winners
router.get("/", async (req, res) => {
    try {
        const winners = await getAllWinners();
        res.status(200).json(winners);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch winners" });
    }
});

// Retrieve the latest winner
router.get("/latest", getLatestWinner);

// Retrieve the winner of a specific race
router.get("/race/:raceId", async (req, res) => {
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

// Manually save the winner of a race
router.post("/:raceId", async (req, res) => {
    try {
        await saveWinner(req.params.raceId);
        res.status(200).json({ message: "Winner successfully saved" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save winner" });
    }
});

export default router;