import Race from "../models/Race.js";
import * as raceService from "../services/raceService.js";
import { sendRaceCreated, sendRaceUpdate } from "../socket.js"; // ✅ WebSockets via socket.js

/**
 * Starts a new race
 */
export const startRace = async (req, res) => {
    try {
        const race = await raceService.createRace();

        // ✅ WebSocket: Notify frontend about the new race
        sendRaceCreated(race);

        res.status(201).json({ message: "Race created successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to start race", error: error.message });
    }
};

/**
 * Retrieves all races
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
 * Retrieves a specific race by ID
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
 * Updates the status of a race
 */
export const updateRaceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const race = await raceService.updateRaceStatus(req.params.raceId, status);
        if (!race) return res.status(404).json({ message: "Race not found" });

        // ✅ WebSocket: Notify frontend about race status update
        sendRaceUpdate(race);

        res.status(200).json({ message: "Race status updated successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to update race status", error: error.message });
    }
};