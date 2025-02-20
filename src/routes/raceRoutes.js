import express from "express";
import { startRace, getRace, getAllRaces, updateRaceStatus } from "../controllers/raceController.js";

const router = express.Router();

// ✅ Start a new race
router.post("/", startRace);

// ✅ Retrieve all races
router.get("/", getAllRaces);

// ✅ Retrieve a specific race by ID
router.get("/:raceId", getRace);

// ✅ Update the status of a race
router.patch("/:raceId/status", updateRaceStatus);

export default router;