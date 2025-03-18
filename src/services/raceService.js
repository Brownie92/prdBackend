import Race from "../models/Race.js";
import Meme from "../models/Meme.js";
import Participant from "../models/Participant.js";
import { getNextRoundStartTime, getNextFiveAM } from "../utils/timeUtils.js";

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
            roundEndTime: getNextFiveAM(), // ✅ Set first round's end time to 05:00 AM CET
            status: "waiting",
        });

        await newRace.save();
        return newRace;
    } catch (error) {
        throw error;
    }
};

/**
 * Updates the race's round end time when 100 participants are reached.
 * If 100 participants are not reached by 05:00, postpone to the next day.
 * @param {string} raceId - The race ID.
 */
export const updateRaceStartTime = async (raceId) => {
    try {
        const race = await Race.findOne({ raceId });
        if (!race) throw new Error("Race not found");

        const participantCount = await Participant.countDocuments({ raceId });

        if (participantCount >= 100) {
            // Update race status to active and set round end time to 05:00 AM CET
            race.status = "active";
            race.roundEndTime = getNextRoundStartTime();
        } else {
            // Keep race in waiting status and postpone Round 2 start to the next day at 05:00 AM CET
            race.status = "waiting";
            race.roundEndTime = getNextRoundStartTime();
        }

        await race.save();
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