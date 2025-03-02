import Participant from "../models/Participant.js";
import Vault from "../models/Vault.js";
import mongoose from "mongoose";
import { sendVaultUpdate } from "../socket.js"; // ✅ WebSocket voor live updates

/**
 * ✅ Registreer een deelnemer en update The Vault
 */
export const registerParticipant = async (req, res) => {
    try {
        const { raceId, walletAddress, memeId, amountSOL } = req.body;

        // ✅ Validatie van invoer
        if (!raceId || !walletAddress || !memeId || !amountSOL) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // ✅ Controleer of memeId een geldig ObjectId is
        if (!mongoose.Types.ObjectId.isValid(memeId)) {
            return res.status(400).json({ success: false, error: "Invalid memeId format" });
        }

        // ✅ Converteer memeId naar ObjectId voor MongoDB
        const memeObjectId = new mongoose.Types.ObjectId(memeId);

        // ✅ Maak een nieuwe deelnemer aan
        const newParticipant = new Participant({
            raceId,
            walletAddress,
            memeId: memeObjectId,
            amountSOL,
        });

        await newParticipant.save();

        // ✅ Voeg SOL toe aan The Vault voor deze race
        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } }, // ✅ Voeg SOL toe aan The Vault
            { upsert: true, new: true }
        );

        console.log(`✅ [VAULT] ${amountSOL} SOL toegevoegd aan Vault voor race ${raceId}`);

        // ✅ WebSocket event versturen naar de UI voor live Vault updates
        sendVaultUpdate(updatedVault);

        return res.status(201).json({ message: "Participant registered successfully", participant: newParticipant, vault: updatedVault });
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