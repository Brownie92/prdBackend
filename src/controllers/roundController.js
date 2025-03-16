import Round from "../models/Round.js";
import Race from "../models/Race.js";
import Boost from "../models/Boost.js";
import { getRoundsByRace } from "../services/roundService.js";
import { calculateProgressAndBoost } from "../utils/raceUtils.js";
import { saveWinner } from "../controllers/winnerController.js";
import { sendRaceUpdate, sendWinnerUpdate, sendRaceClosed } from "../socket.js";
import Participant from "../models/Participant.js";
import { DateTime } from "luxon";

const getNextRoundStartTime = () => {
    const now = DateTime.now().setZone("Europe/Amsterdam");
    const nextRoundStart = now.set({ hour: 5, minute: 0, second: 0, millisecond: 0 });
    return nextRoundStart < now ? nextRoundStart.plus({ days: 1 }) : nextRoundStart;
};

/**
 * ✅ Retrieve all rounds for a specific race
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
 * ✅ Process a new round: calculate progress and save the round
 */
export const processRound = async (race) => {
    try {
        if (race.status === "closed") {
            return { message: "Race is closed. No further rounds can be processed." };
        }

        // ✅ 1️⃣ Check if Round 1 has enough participants and wait for 05:00 AM
        if (race.currentRound === 1) {
            const participantCount = await Participant.countDocuments({ raceId: race.raceId });

            if (participantCount < 100) {
                console.log(`[INFO] 🛑 Not enough participants (${participantCount}/1). Race remains open.`);
                race.roundEndTime = getNextRoundStartTime().toJSDate(); // Extend round 1 to next 05:00 AM
                await race.save();
                sendRaceUpdate(race);
                return { race, message: "Not enough participants. Round 1 extended." };
            }

            const now = new Date();
            if (now < race.roundEndTime) {
                console.log(`[INFO] ⏳ Waiting for Round 1 to reach 05:00 AM CET.`);
                return { race, message: "Waiting for Round 1 end time." };
            }

            // ✅ Update race status from "waiting" to "active"
            race.status = "active";
            await race.save();
            sendRaceUpdate(race);
        }

        // ✅ 2️⃣ Retrieve all boosts for this round
        const boostSummary = await Boost.aggregate([
            { $match: { raceId: race.raceId, round: race.currentRound } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        // ✅ 3️⃣ Calculate progress and boosts
        const { updatedMemes, roundLog } = await calculateProgressAndBoost(race.memes, boostSummary);

        // ✅ 4️⃣ Save the round in the database
        const newRound = new Round({
            raceId: race.raceId,
            roundNumber: race.currentRound,
            progress: roundLog.progress.map(meme => {
                const boostInfo = roundLog.boosts.find(boost => boost.memeId === meme.memeId) || { boostAmount: 0, boosted: false };
                return {
                    memeId: meme.memeId,
                    progress: meme.progress,
                    boosted: boostInfo.boosted,
                    boostAmount: boostInfo.boostAmount
                };
            }),
            winner: roundLog.winner
        });
        await newRound.save();

        // ✅ 5️⃣ Update progress in the race collection
        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { 
                $group: { 
                    _id: "$progress.memeId",
                    baseProgress: { $sum: "$progress.progress" },  
                    boostProgress: { $sum: "$progress.boostAmount" }
                }
            }
        ]);

        race.memes = race.memes.map(meme => {
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { baseProgress: 0, boostProgress: 0 };
            return {
                ...meme,
                progress: progressInfo.baseProgress + progressInfo.boostProgress
            };
        });
        
        await race.save();

        // ✅ 6️⃣ Proceed to the next round or close the race
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(race.roundEndTime.getTime() + 3 * 60 * 60 * 1000); // Add 3 hours
        } else {
            race.status = "closed";
            await race.save();
            sendRaceClosed(race);
            try {
                await saveWinner(race.raceId);
                sendWinnerUpdate(race.raceId);
            } catch (winnerError) {
                console.error("[ERROR] ❌ Error saving winner:", winnerError);
            }
            return { race, newRound };
        }

        await race.save();

        // ✅ 7️⃣ Send WebSocket update with the latest ranking
        sendRaceUpdate(race);

        return { race, newRound };
    } catch (error) {
        console.error("[ERROR] Failed to process round:", error);
        throw error;
    }
};
