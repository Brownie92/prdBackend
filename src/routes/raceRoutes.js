import express from "express";
import { startRace, getRace, getAllRaces, updateRaceStatus, getCurrentRace } from "../controllers/raceController.js";

const router = express.Router();

// ✅ Route om de huidige race op te halen
router.get("/current", getCurrentRace);

// ✅ Start een nieuwe race
router.post("/", startRace);

// ✅ Haal alle races op
router.get("/", getAllRaces);

// ✅ Haal een specifieke race op
router.get("/:raceId", getRace);

// ✅ Update de status van een race
router.patch("/:raceId/status", updateRaceStatus);

export default router;