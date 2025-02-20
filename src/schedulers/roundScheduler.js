import cron from "node-cron";
import Race from "../models/Race.js";
import { processRound } from "../controllers/roundController.js";

console.log("[INFO] ⏳ Round scheduler initialized...");

// 🔄 Check every minute if a round has expired and needs processing
cron.schedule("* * * * *", async () => {
    console.log("[INFO] 🔍 Checking for races with expired rounds...");
    
    try {
        const now = new Date();
        const activeRaces = await Race.find({ status: "active", roundEndTime: { $lte: now } });

        if (activeRaces.length === 0) {
            console.log("[INFO] ✅ No expired rounds found.");
            return;
        }

        console.log(`[INFO] ⏳ Found ${activeRaces.length} races with expired rounds. Processing...`);

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