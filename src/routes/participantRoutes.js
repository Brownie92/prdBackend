import express from "express";
import { checkParticipantExists, registerParticipant, getParticipantsByRace } from "../controllers/participantController.js";

const router = express.Router();


// ✅ Controleer of een wallet al een deelnemer is voor deze race
router.get("/check/:raceId/:walletAddress", checkParticipantExists);

// ✅ Registreer een deelnemer
router.post("/", registerParticipant);

// ✅ Haal alle deelnemers van een specifieke race op
router.get("/:raceId", getParticipantsByRace);

export default router;