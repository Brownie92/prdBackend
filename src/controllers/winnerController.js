import Winner from "../models/Winner.js";
import Race from "../models/Race.js";
import Meme from "../models/Meme.js";
import { getIo } from "../socket.js";

/**
 * Save the winner once the race is closed.
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

    await Race.findOneAndUpdate({ raceId }, { status: "closed" });

    const io = getIo();
    io.emit("raceClosed", { raceId, status: "closed" });

    const winningMeme = race.memes.reduce((max, meme) =>
      meme.progress > max.progress ? meme : max
    );

    const memeData = await Meme.findById(winningMeme.memeId);
    if (!memeData) {
      console.error(`[ERROR] Meme ${winningMeme.memeId} not found!`);
      return;
    }

    const winner = new Winner({
      raceId: race.raceId,
      memeId: winningMeme.memeId,
      memeUrl: memeData.url, // ✅ Sla de meme URL direct op!
      progress: winningMeme.progress,
    });

    await winner.save();

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
 * Retrieve the winner for a specific race.
 */
export const getWinnerByRaceId = async (raceId) => {
  try {
    return await Winner.findOne({ raceId }).populate("memeId") || null;
  } catch (error) {
    console.error(`[ERROR] Failed to fetch winner:`, error);
    throw error;
  }
};

/**
 * Retrieve the latest winner (most recent winner).
 */
export const getLatestWinner = async (req, res) => {
  try {
    console.log("[DEBUG] Fetching latest winner...");

    const latestWinner = await Winner.findOne().sort({ createdAt: -1 });

    if (!latestWinner) {
      console.warn("[WARNING] No winner found in database.");
      return res.status(404).json({ error: "Winner not found" });
    }

    console.log("[DEBUG] Latest Winner Found:", latestWinner);

    return res.status(200).json(latestWinner);
  } catch (error) {
    console.error("[ERROR] Failed to fetch latest winner:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Retrieve all winners (frontend filters the last 10).
 */
export const getAllWinners = async () => {
  try {
    return await Winner.find().sort({ createdAt: -1 }).populate("memeId");
  } catch (error) {
    console.error(`[ERROR] Failed to fetch all winners:`, error);
    throw error;
  }
};