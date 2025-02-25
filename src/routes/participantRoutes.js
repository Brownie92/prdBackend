import express from "express";
import { registerParticipant, getParticipantsByRace } from "../controllers/participantController.js";

const router = express.Router();

// ✅ Registreer een deelnemer (POST /api/participants)
router.post("/", registerParticipant);

// ✅ Haal alle deelnemers van een specifieke race op (GET /api/participants/:raceId)
router.get("/:raceId", getParticipantsByRace);

export default router;