import Round from "../models/Round.js";
import Race from "../models/Race.js";
import { getRoundsByRace } from "../services/roundService.js";
import { calculateProgressAndBoost } from "../utils/raceUtils.js";
import { saveWinner } from "../controllers/winnerController.js";
import { sendRaceUpdate, sendWinnerUpdate } from "../socket.js";

/**
 * Fetch all rounds for a specific race
 * @route GET /api/rounds/:raceId
 */
export const getRounds = async (req, res) => {
    const { raceId } = req.params;

    try {
        const rounds = await getRoundsByRace(raceId);
        res.status(200).json({ raceId, rounds });
    } catch (error) {
        res.status(500).json({ message: "Error fetching rounds", error: error.message });
    }
};

/**
 * Process a new round: calculate progress and save the round
 */
export const processRound = async (race) => {
    try {
        // ✅ Check if the race is already closed
        if (race.status === "closed") {
            return { message: "Race is closed. No further rounds can be processed." };
        }

        // **1️⃣ Calculate progress and boosts for memes**
        const { updatedMemes, roundLog } = calculateProgressAndBoost(race.memes);

        // **2️⃣ Create and save a new round**
        const newRound = new Round({
            raceId: race.raceId,
            roundNumber: race.currentRound,
            progress: roundLog.progress.map(meme => ({
                memeId: meme.memeId,
                progress: meme.progress,
                boosted: meme.boosted,
                boostAmount: meme.boostAmount
            })),
            winner: roundLog.winner
        });
        await newRound.save();

        // **3️⃣ Retrieve cumulative progress from the Round collection**
        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { $group: { _id: "$progress.memeId", totalProgress: { $sum: "$progress.progress" } } }
        ]);

        // **4️⃣ Update the Race collection with new progress**
        race.memes = race.memes.map(meme => {
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { totalProgress: 0 };

            return {
                ...meme,
                progress: progressInfo.totalProgress // ✅ Update progress
            };
        });

        // **5️⃣ Move to the next round or close the race**
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = "closed";
            await race.save();
            try {
                await saveWinner(race.raceId);
                sendWinnerUpdate(race.raceId); // ✅ Send winner update to the frontend
            } catch (winnerError) {
                console.error(`Error saving winner:`, winnerError);
            }
            return { race, newRound };
        }

        // ✅ Save race before sending WebSocket updates
        await race.save();

        // ✅ Send WebSocket update
        sendRaceUpdate(race);

        return { race, newRound };
    } catch (error) {
        console.error("[ERROR] Failed to process round:", error);
        throw error;
    }
};