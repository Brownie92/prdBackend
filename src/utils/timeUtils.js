import { DateTime } from "luxon";

/**
 * Returns the next occurrence of 05:00 AM CET (Europe/Amsterdam timezone).
 * If it's already past 05:00 AM today, return tomorrow's 05:00 AM.
 */
export const getNextFiveAM = () => {
    const now = DateTime.now().setZone("Europe/Amsterdam");
    let nextFiveAM = now.set({ hour: 5, minute: 0, second: 0, millisecond: 0 });

    if (now.toMillis() >= nextFiveAM.toMillis()) {
        nextFiveAM = nextFiveAM.plus({ days: 1 });
    }

    return nextFiveAM.toJSDate();
};

/**
 * Determines the next round start time.
 * - Round 2 starts at 05:00 AM CET when 100 participants are reached.
 * - If 100 participants are not reached, the race is postponed to the next 05:00 AM.
 */
export const getNextRoundStartTime = () => {
    return getNextFiveAM();
};