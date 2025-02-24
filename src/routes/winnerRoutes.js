import express from "express";
import { saveWinner, getWinnerByRaceId, getAllWinners } from "../controllers/winnerController.js";

const router = express.Router();

// Get all winners
router.get("/", async (req, res) => {
    try {
      const winners = await getAllWinners();
      res.status(200).json(winners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch winners" });
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