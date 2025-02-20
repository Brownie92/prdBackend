import express from "express";
import { registerParticipant, getParticipantsByRace } from "../controllers/participantController.js";

const router = express.Router();

// ✅ Register a new participant
router.post("/", registerParticipant);

// ✅ Fetch all participants for a specific race
router.get("/:raceId", getParticipantsByRace);

export default router;