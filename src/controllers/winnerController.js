import Winner from "../models/Winner.js";
import Race from "../models/Race.js";
import { getIo } from "../socket.js"; // ✅ Correct WebSocket import

/**
 * ✅ Save the winner once the race is closed.
 */
export const saveWinner = async (raceId) => {
    try {
        const race = await Race.findOne({ raceId });

        if (!race) {
            console.warn(`[WARNING] Race ${raceId} not found.`);
            return;
        }

        if (race.status !== "closed") {
            console.warn(`[WARNING] Race ${raceId} is not closed yet.`);
            return;
        }

        console.log(`[INFO] Determining winner for race ${raceId}...`);

        // ✅ Mark the race as closed
        await Race.findOneAndUpdate({ raceId }, { status: "closed" });

        // ✅ Emit raceClosed event **BEFORE** saving the winner
        const io = getIo();
        io.emit("raceClosed", { raceId, status: "closed" });

        // ✅ Determine the winning meme
        const winningMeme = race.memes.reduce((max, meme) =>
            meme.progress > max.progress ? meme : max
        );

        // ✅ Save the winner
        const winner = new Winner({
            raceId: race.raceId,
            memeId: winningMeme.memeId,
            progress: winningMeme.progress,
        });

        await winner.save();

        // ✅ Emit winnerUpdate via WebSocket with a small delay to ensure data consistency
        setTimeout(() => {
            io.emit("winnerUpdate", winner);
        }, 500);

        return winner;
    } catch (error) {
        console.error(`[ERROR] Failed to save winner:`, error);
        throw error;
    }
};

/**
 * ✅ Retrieve the winner for a specific race.
 */
export const getWinnerByRaceId = async (raceId) => {
    try {
        // ✅ Fetch the winner and populate meme details
        const winner = await Winner.findOne({ raceId }).populate("memeId");

        if (!winner) {
            return null;
        }

        return winner;
    } catch (error) {
        console.error(`[ERROR] Failed to fetch winner:`, error);
        throw error;
    }
};