import express from "express";
import { checkParticipantExists, registerParticipant, getParticipantsByRace } from "../controllers/participantController.js";

const router = express.Router();

// Check if a wallet is already a participant in this race
router.get("/check/:raceId/:walletAddress", checkParticipantExists);

// Register a participant
router.post("/", registerParticipant);

// Retrieve all participants for a specific race
router.get("/:raceId", getParticipantsByRace);

export default router;