import express from "express";
import { startRace, getRace, getAllRaces, updateRaceStatus, getCurrentRace } from "../controllers/raceController.js";

const router = express.Router();

// Route to get the current race
router.get("/current", getCurrentRace);

// Start a new race
router.post("/", startRace);

// Get all races
router.get("/", getAllRaces);

// Get a specific race
router.get("/:raceId", getRace);

// Update the status of a race
router.patch("/:raceId/status", updateRaceStatus);

export default router;