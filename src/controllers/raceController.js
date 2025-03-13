import Race from "../models/Race.js";
import * as raceService from "../services/raceService.js";
import Vault from "../models/Vault.js";
import { sendRaceCreated, sendRaceUpdate, sendRaceClosed } from "../socket.js";

/**
 * Start a new race
 */
export const startRace = async (req, res) => {
    try {
        const race = await raceService.createRace();

        // Create a Vault entry for this race with 0 SOL
        const newVault = new Vault({
            raceId: race.raceId,
            totalSol: 0,
        });

        await newVault.save();

        // WebSocket: Send race event to frontend
        sendRaceCreated(race);

        res.status(201).json({ message: "Race created successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to start race", error: error.message });
    }
};

/**
 * Retrieve all races
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
 * Retrieve a specific race by ID
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
 * Retrieve the most recent active race
 */
export const getCurrentRace = async (req, res) => {
    try {
        const latestRace = await Race.findOne({ status: "active" }).sort({ createdAt: -1 });

        if (!latestRace) {
            return res.status(404).json({ message: "No active race found" });
        }

        res.status(200).json({
            raceId: latestRace.raceId,
            memes: latestRace.memes,
            currentRound: latestRace.currentRound,
            roundEndTime: latestRace.roundEndTime,
            status: latestRace.status,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch current race", error: error.message });
    }
};

/**
 * Update the status of a race
 */
export const updateRaceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const race = await raceService.updateRaceStatus(req.params.raceId, status);
        if (!race) return res.status(404).json({ message: "Race not found" });

        // WebSocket: Send race update event
        sendRaceUpdate(race);

        // If the race is closed, send a separate event
        if (status === "closed") {
            sendRaceClosed(race);
        }

        res.status(200).json({ message: "Race status updated successfully", race });
    } catch (error) {
        res.status(500).json({ message: "Failed to update race status", error: error.message });
    }
};