import cron from "node-cron";
import Race from "../models/Race.js";
import Participant from "../models/Participant.js"; // Added import for Participant model
import { processRound } from "../controllers/roundController.js";

console.log("[INFO] ⏳ Round scheduler initialized...");

// Check every minute if Round 1 can proceed to Round 2 based on participant count
cron.schedule("* * * * *", async () => { 
    try {
        const now = new Date();
        const activeRaces = await Race.find({ status: "waiting", currentRound: 1 });

        for (const race of activeRaces) {
            const participantCount = await Participant.countDocuments({ raceId: race.raceId });

            if (participantCount >= 100) {
                console.log(`[INFO] ✅ Round 1 has ${participantCount} participants. Proceeding to Round 2 for race ${race.raceId}`);
                await processRound(race);
            } else {
                console.log(`[INFO] 🔄 Not enough participants (${participantCount}/100) to proceed`);
            }
        }
    } catch (error) {
        console.error("[ERROR] ❌ Failed to check if Round 1 can proceed:", error);
    }
});

// Check every minute if an active race's round has ended and needs processing
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const activeRaces = await Race.find({ status: "active", roundEndTime: { $lte: now }, currentRound: { $gte: 2 } });

        if (activeRaces.length === 0) {
            console.log("[INFO] ⏳ No active races require processing at this time.");
            return;
        }

        for (const race of activeRaces) {
            try {
                await processRound(race);
                console.log(`[INFO] ✅ Successfully processed to round ${race.currentRound} for race ${race.raceId}`);
            } catch (error) {
                console.error(`[ERROR] ❌ Failed to process round for race ${race.raceId}:`, error);
            }
        }
    } catch (error) {
        console.error("[ERROR] ❌ Failed to check expired races:", error);
    }
});