import Participant from "../models/Participant.js";
import Vault from "../models/Vault.js";
import mongoose from "mongoose";
import { sendVaultUpdate } from "../socket.js"; // WebSocket for live updates

/**
 * Register a participant and update The Vault
 */
export const registerParticipant = async (req, res) => {
    try {
        const { raceId, walletAddress, memeId, amountSOL } = req.body;

        // Validate input fields
        if (!raceId || !walletAddress || !memeId || !amountSOL) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Check if memeId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(memeId)) {
            return res.status(400).json({ success: false, error: "Invalid memeId format" });
        }

        // Convert memeId to ObjectId for MongoDB
        const memeObjectId = new mongoose.Types.ObjectId(memeId);

        // Create a new participant
        const newParticipant = new Participant({
            raceId,
            walletAddress,
            memeId: memeObjectId,
            amountSOL,
        });

        await newParticipant.save();

        // Add SOL to The Vault for this race
        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } }, // Add SOL to The Vault
            { upsert: true, new: true }
        );

        // Send WebSocket event to the UI for live Vault updates
        sendVaultUpdate(updatedVault);

        return res.status(201).json({ message: "Participant registered successfully", participant: newParticipant, vault: updatedVault });
    } catch (error) {
        console.error("Error registering participant:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

/**
 * Fetch all participants of a specific race.
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

/**
 * Check if a wallet is already a participant of a race
 */
export const checkParticipantExists = async (req, res) => {
  try {
      const { raceId, walletAddress } = req.params;

      // Validate input parameters
      if (!raceId || !walletAddress) {
          return res.status(400).json({ error: "Missing required parameters" });
      }

      // Check if the user has already chosen a meme for this race
      const existingParticipant = await Participant.findOne({ raceId, walletAddress });

      if (existingParticipant) {
          return res.json({ exists: true, memeId: existingParticipant.memeId });
      } else {
          return res.json({ exists: false });
      }
  } catch (error) {
      console.error("❌ Error checking participant:", error);
      return res.status(500).json({ error: "Internal Server Error" });
  }
};