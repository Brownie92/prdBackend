import Race from "../models/Race.js";
import * as raceService from "../services/raceService.js";
import { sendRaceCreated, sendRaceUpdate } from "../socket.js"; // ✅ WebSockets via socket.js

/**
 * ✅ Start een nieuwe race
 */
export const startRace = async (req, res) => {
    try {
        const race = await raceService.createRace();

        // ✅ WebSocket: Stuur race event naar frontend
        sendRaceCreated(race);

        res.status(201).json({ message: "Race created successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to start race", error: error.message });
    }
};

/**
 * ✅ Haal alle races op
 */
export const getAllRaces = async (req, res) => {
    try {
        const races = await Race.find();
        res.status(200).json(races);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch races", error: error.message });
    }
};

/**
 * ✅ Haal een specifieke race op via ID
 */
export const getRace = async (req, res) => {
    try {
        const race = await raceService.getRaceById(req.params.raceId);
        if (!race) return res.status(404).json({ message: "Race not found" });

        res.status(200).json(race);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch race", error: error.message });
    }
};

/**
 * ✅ Haal de meest recente actieve race op
 */
export const getCurrentRace = async (req, res) => {
    try {
        const latestRace = await Race.findOne({ status: "active" }).sort({ createdAt: -1 });

        if (!latestRace) {
            return res.status(404).json({ message: "No active race found" });
        }

        res.status(200).json({
            raceId: latestRace._id,
            memes: latestRace.memes,
            currentRound: latestRace.currentRound, // 🔥 Zorg dat dit altijd correct is
            roundEndTime: latestRace.roundEndTime,
            status: latestRace.status,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch current race", error: error.message });
    }
};
/**
 * ✅ Update de status van een race
 */
export const updateRaceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const race = await raceService.updateRaceStatus(req.params.raceId, status);
        if (!race) return res.status(404).json({ message: "Race not found" });

        // ✅ WebSocket: Stuur race update event
        sendRaceUpdate(race);

        res.status(200).json({ message: "Race status updated successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to update race status", error: error.message });
    }
};