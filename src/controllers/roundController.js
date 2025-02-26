import Round from "../models/Round.js";
import Race from "../models/Race.js";
import Boost from "../models/Boost.js";
import { getRoundsByRace } from "../services/roundService.js";
import { calculateProgressAndBoost } from "../utils/raceUtils.js";
import { saveWinner } from "../controllers/winnerController.js";
import { sendRaceUpdate, sendWinnerUpdate } from "../socket.js";

/**
 * ✅ Haal alle rondes op voor een specifieke race
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
 * ✅ Verwerk een nieuwe ronde: bereken progressie en sla de ronde op
 */
export const processRound = async (race) => {
    try {
        if (race.status === "closed") {
            return { message: "Race is closed. No further rounds can be processed." };
        }

        console.log(`🟢 Processing Round ${race.currentRound} for Race ${race.raceId}`);

        // ✅ 1️⃣ Haal alle boosts op voor deze ronde
        const boostSummary = await Boost.aggregate([
            { $match: { raceId: race.raceId, round: race.currentRound } },
            { $group: { _id: "$memeId", totalSol: { $sum: "$amountSOL" } } },
            { $sort: { totalSol: -1 } }
        ]);

        console.log(`[DEBUG] 🔍 Boost summary for Race ${race.raceId} Round ${race.currentRound}:`, boostSummary);

        // ✅ 2️⃣ Bereken progressie en boosts
        const { updatedMemes, roundLog } = await calculateProgressAndBoost(race.memes, boostSummary);

        // ✅ 3️⃣ Sla de ronde op in de database (basis progress en boost progress apart)
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
        console.log(`[DEBUG] ✅ Boosts correct opgeslagen in Round:`, newRound.progress);

        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { 
                $group: { 
                    _id: "$progress.memeId",
                    baseProgress: { $sum: "$progress.progress" },  
                    boostProgress: { $sum: "$progress.boostAmount" }  // ✅ Nu werkt het correct!
                }
            }
        ]);
        
        console.log(`[DEBUG] ✅ Total progress per meme from Round collection:`, progressData);

        // ✅ 5️⃣ Update progress in de `Race` collectie
        race.memes = race.memes.map(meme => {
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { baseProgress: 0, boostProgress: 0 };
            return {
                ...meme,
                progress: progressInfo.baseProgress + progressInfo.boostProgress  // ✅ Correcte totale progressie opslaan
            };
        });
        
        await race.save();
        console.log(`[DEBUG] ✅ Updated race progress:`, race.memes);

        // ✅ 6️⃣ Ga door naar de volgende ronde of sluit de race af
        if (race.currentRound < 6) {
            race.currentRound += 1;
            race.roundEndTime = new Date(Date.now() + 3 * 60 * 1000);
        } else {
            race.status = "closed";
            await race.save();
            try {
                await saveWinner(race.raceId);
                sendWinnerUpdate(race.raceId);
            } catch (winnerError) {
                console.error(`Error saving winner:`, winnerError);
            }
            return { race, newRound };
        }

        await race.save();

        // ✅ 7️⃣ Stuur WebSocket update met de nieuwste ranking
        sendRaceUpdate(race);

        return { race, newRound };
    } catch (error) {
        console.error("[ERROR] Failed to process round:", error);
        throw error;
    }
};