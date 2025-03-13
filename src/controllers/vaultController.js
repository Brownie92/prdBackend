import Vault from "../models/Vault.js";
import Race from "../models/Race.js";
import { sendVaultUpdate } from "../socket.js";

/**
 * ✅ **Adds SOL to the Vault of a race**
 */
export const updateVault = async (raceId, amountSOL) => {
    try {
        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } }, 
            { new: true, upsert: true } 
        );

        console.log(`✅ [VAULT] Updated Vault: ${updatedVault.totalSol} SOL for race ${raceId}`);

        sendVaultUpdate(updatedVault);

        return updatedVault;
    } catch (error) {
        console.error("❌ Error updating Vault:", error);
        throw error;
    }
};

/**
 * ✅ **Fetches the Vault data for a specific race**
 */
export const getVaultByRace = async (req, res) => {
    try {
        const { raceId } = req.params;

        const vault = await Vault.findOne({ raceId });

        if (!vault) {
            return res.status(404).json({ error: "Vault not found for this race." });
        }

        res.status(200).json(vault);
    } catch (error) {
        console.error("❌ Error fetching Vault:", error);
        res.status(500).json({ error: "Failed to retrieve Vault data." });
    }
};

/**
 * ✅ Fetches the Vault of the most recent active race
 */
export const getLatestActiveVault = async (req, res) => {
    try {
        const latestActiveRace = await Race.findOne({ status: "active" }).sort({ createdAt: -1 });

        if (!latestActiveRace) {
            return res.status(404).json({ message: "No active race found." });
        }

        const raceId = latestActiveRace.raceId;

        const activeVault = await Vault.findOne({ raceId });

        if (!activeVault) {
            return res.status(404).json({ message: "No Vault found for latest active race." });
        }

        res.status(200).json({
            raceId: activeVault.raceId,
            totalSol: activeVault.totalSol
        });
    } catch (error) {
        console.error("[ERROR] ❌ Failed to fetch latest active vault:", error);
        res.status(500).json({ error: "Failed to fetch latest active vault." });
    }
};

/**
 * ✅ Fetches the Vault of the most recent closed race
 */
export const getLatestVault = async (req, res) => {
    try {
        const lastClosedRace = await Race.findOne({ status: "closed" }).sort({ roundEndTime: -1 });

        if (!lastClosedRace) {
            return res.status(404).json({ message: "No closed race found." });
        }

        const raceId = lastClosedRace.raceId;

        const latestVault = await Vault.findOne({ raceId });

        if (!latestVault) {
            return res.status(404).json({ message: "No Vault found for last closed race." });
        }

        res.status(200).json({
            raceId: latestVault.raceId,
            totalSol: latestVault.totalSol
        });
    } catch (error) {
        console.error("[ERROR] ❌ Failed to fetch latest vault:", error);
        res.status(500).json({ error: "Failed to fetch latest vault." });
    }
};