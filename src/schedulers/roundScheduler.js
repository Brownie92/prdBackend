import cron from "node-cron";
import Race from "../models/Race.js";
import { processRound } from "../controllers/roundController.js";

console.log("[INFO] ⏳ Round scheduler initialized...");

// Schedule a task to check every minute if a round has expired
cron.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const activeRaces = await Race.find({ status: "active", roundEndTime: { $lte: now } });

        if (activeRaces.length === 0) {
            return;
        }

        for (const race of activeRaces) {
            try {
                await processRound(race);
                console.log(`[INFO] ✅ Successfully processed round ${race.currentRound} for race ${race.raceId}`);
            } catch (error) {
                console.error(`[ERROR] ❌ Failed to process round for race ${race.raceId}:`, error);
            }
        }
    } catch (error) {
        console.error("[ERROR] ❌ Failed to check expired races:", error);
    }
});