import Round from "../models/Round.js";
import Race from "../models/Race.js";
import Boost from "../models/Boost.js";
import { getRoundsByRace } from "../services/roundService.js";
import { calculateProgressAndBoost } from "../utils/raceUtils.js";
import { saveWinner } from "../controllers/winnerController.js";
import { sendRaceUpdate, sendWinnerUpdate, sendRaceClosed } from "../socket.js";

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

        // console.log(`🟢 Processing Round ${race.currentRound} for Race ${race.raceId}`);

        // ✅ 1️⃣ Retrieve all boosts for this round
        const boostSummary = await Boost.aggregate([
            { $match: { raceId: race.raceId, round: race.currentRound } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        // console.log(`[DEBUG] 🔍 Boost summary for Race ${race.raceId} Round ${race.currentRound}:`, boostSummary);

        // ✅ 2️⃣ Calculate progress and boosts
        const { updatedMemes, roundLog } = await calculateProgressAndBoost(race.memes, boostSummary);

        // ✅ 3️⃣ Save the round in the database (base progress and boost progress separately)
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
        // console.log(`[DEBUG] ✅ Boosts correct opgeslagen in Round:`, newRound.progress);

        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { 
                $group: { 
                    _id: "$progress.memeId",
                    baseProgress: { $sum: "$progress.progress" },  
                    boostProgress: { $sum: "$progress.boostAmount" }  // ✅ Now it works correctly!
                }
            }
        ]);
        
        // console.log(`[DEBUG] ✅ Total progress per meme from Round collection:`, progressData);

        // ✅ 5️⃣ Update progress in the 'Race' collection
        race.memes = race.memes.map(meme => {
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { baseProgress: 0, boostProgress: 0 };
            return {
                ...meme,
                progress: progressInfo.baseProgress + progressInfo.boostProgress  // ✅ Save correct total progress
            };
        });
        
        await race.save();
        // console.log(`[DEBUG] ✅ Updated race progress:`, race.memes);

        // ✅ 6️⃣ Proceed to the next round or close the race
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = "closed";
            await race.save();
            
            // console.log("[DEBUG] ✅ Race status updated to closed:", race); // ✅ Log for debugging
            
            sendRaceClosed(race); // ✅ Send WebSocket event that race is closed
            
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
