import express from "express";
import { addBoost, getBoostsByRace } from "../controllers/boostController.js";

const router = express.Router();

// ✅ Boost registratie endpoint
router.post("/", addBoost);

// ✅ Nieuwe GET-route om boosts op te halen per race (verplicht raceId en round)
router.get("/:raceId/:round", getBoostsByRace);

export default router;