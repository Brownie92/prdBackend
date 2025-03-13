import Race from "../models/Race.js";
import Meme from "../models/Meme.js";

/**
 * Creates a new race with random memes.
 * @returns {Promise<Race>} The created race object.
 */
export const createRace = async () => {
    const raceId = `race${Date.now()}`;

    try {
        const totalMemes = await Meme.countDocuments();
        if (totalMemes < 6) {
            throw new Error("Not enough memes in the database to start a race");
        }

        const randomMemes = totalMemes === 6
            ? await Meme.find().limit(6)
            : await Meme.aggregate([{ $sample: { size: 6 } }]);

        const newRace = new Race({
            raceId,
            memes: randomMemes.map(meme => ({
                memeId: meme.memeId.toString(),
                name: meme.name,
                url: meme.url,
                votes: 0,
                progress: 0,
            })),
            currentRound: 1,
            roundEndTime: new Date(Date.now() + 3 * 60 * 1000),
        });

        await newRace.save();
        return newRace;
    } catch (error) {
        throw error;
    }
};

/**
 * Retrieves a race by its ID.
 * @param {string} raceId - The race ID.
 * @returns {Promise<Race|null>} The race object or null if not found.
 */
export const getRaceById = async (raceId) => {
    return await Race.findOne({ raceId });
};

/**
 * Updates the status of a race.
 * @param {string} raceId - The race ID.
 * @param {string} status - The new race status.
 * @returns {Promise<Race|null>} The updated race object or null if not found.
 */
export const updateRaceStatus = async (raceId, status) => {
    return await Race.findOneAndUpdate({ raceId }, { status }, { new: true });
};