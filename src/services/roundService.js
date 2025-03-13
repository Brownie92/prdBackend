import Round from "../models/Round.js";

/**
 * Retrieves all rounds for a given race.
 * @param {string} raceId - The ID of the race.
 * @returns {Promise<Array>} - A list of rounds sorted by round number.
 */
export const getRoundsByRace = async (raceId) => {
    try {
        return await Round.find({ raceId }).sort({ roundNumber: 1 });
    } catch (error) {
        throw error;
    }
};