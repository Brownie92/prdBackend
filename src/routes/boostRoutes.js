import express from "express";
import { addBoost, getBoostsByRace } from "../controllers/boostController.js";

const router = express.Router();

// Boost registration endpoint
router.post("/", addBoost);

// New GET route to retrieve boosts by race (requires raceId and round)
router.get("/:raceId/:round", getBoostsByRace);

export default router;