import Round from "../models/Round.js";
import Race from "../models/Race.js";
import Boost from "../models/Boost.js"; // ✅ Boosts ophalen
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

        // ✅ 2️⃣ Bereken progressie en boosts op basis van ingezette SOL
        const { updatedMemes, roundLog } = await calculateProgressAndBoost(race.memes, boostSummary);

        // ✅ 3️⃣ Sla de ronde op in de database
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

        // ✅ 4️⃣ Haal de totale progressie per meme op uit de `Round` collectie
        const progressData = await Round.aggregate([
            { $match: { raceId: race.raceId } },
            { $unwind: "$progress" },
            { $group: { _id: "$progress.memeId", totalProgress: { $sum: "$progress.progress" } } }
        ]);

        // ✅ 5️⃣ Update de progressie in de `Race` collectie
        race.memes = race.memes.map(meme => {
            const progressInfo = progressData.find(p => p._id?.toString() === meme.memeId?.toString()) || { totalProgress: 0 };

            return {
                ...meme,
                progress: progressInfo.totalProgress
            };
        });

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