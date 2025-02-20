import Race from "../models/Race.js";
import Meme from "../models/Meme.js";
import Participant from "../models/Participant.js";

/**
 * Registers a participant in a race
 */
export const registerParticipant = async (req, res) => {
    try {
        const { raceId, walletAddress, memeId } = req.body;

        // Validate required fields
        if (!raceId || !walletAddress || !memeId) {
            return res.status(400).json({ message: "Race ID, Wallet Address, and Meme ID are required" });
        }

        // Check if the race exists
        const raceExists = await Race.findOne({ raceId });
        if (!raceExists) {
            return res.status(404).json({ message: "Race not found" });
        }

        // Check if the selected meme exists
        const memeExists = await Meme.findById(memeId);
        if (!memeExists) {
            return res.status(404).json({ message: "Selected meme not found" });
        }

        // Ensure the wallet is not already registered for this race
        const existingParticipant = await Participant.findOne({ raceId, walletAddress });
        if (existingParticipant) {
            return res.status(400).json({ message: "You are already registered for this race" });
        }

        // Create and save the new participant
        const newParticipant = new Participant({
            raceId,
            walletAddress,
            memeId
        });

        await newParticipant.save();
        res.status(201).json({ message: "Participant successfully registered", participant: newParticipant });

    } catch (error) {
        res.status(500).json({ message: "Error registering participant", error: error.message });
    }
};

/**
 * Retrieves all participants for a specific race
 */
export const getParticipantsByRace = async (req, res) => {
    const { raceId } = req.params;

    try {
        const participants = await Participant.find({ raceId });
        res.status(200).json({ raceId, participants });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};