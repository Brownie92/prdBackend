import Participant from "../models/Participant.js";
import mongoose from "mongoose";

/**
 * ✅ Registreer een deelnemer in de race na succesvolle betaling.
 */
export const registerParticipant = async (req, res) => {
    try {
      const { raceId, walletAddress, memeId, amountSOL } = req.body;
  
      // Validatie van vereiste velden
      if (!raceId || !walletAddress || !memeId || !amountSOL) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      // Converteer memeId naar ObjectId
      const memeObjectId = new mongoose.Types.ObjectId(memeId);
  
      // ✅ Maak een nieuwe deelnemer aan
      const newParticipant = new Participant({
        raceId,
        walletAddress,
        memeId: memeObjectId, // Zorg ervoor dat memeId als ObjectId wordt opgeslagen
        amountSOL,
      });
  
      await newParticipant.save();
  
      // ✅ Antwoord met succesbericht
      return res.status(201).json({ message: "Participant registered successfully", participant: newParticipant });
    } catch (error) {
      console.error("Error registering participant:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  };

/**
 * ✅ Haal alle deelnemers van een specifieke race op.
 */
export const getParticipantsByRace = async (req, res) => {
    try {
        const { raceId } = req.params;
        const participants = await Participant.find({ raceId }).populate("memeId");
        res.status(200).json(participants);
    } catch (error) {
        console.error(`[ERROR] ❌ Failed to fetch participants:`, error);
        res.status(500).json({ error: "Failed to fetch participants" });
    }
};