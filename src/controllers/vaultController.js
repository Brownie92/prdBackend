import Vault from "../models/Vault.js";
import Race from "../models/Race.js";
import { sendVaultUpdate } from "../socket.js";

/**
 * ✅ **Voegt SOL toe aan de Vault van een race**
 */
export const updateVault = async (raceId, amountSOL) => {
    try {
        // ✅ Zoek de juiste Vault en verhoog het totaal SOL-bedrag
        const updatedVault = await Vault.findOneAndUpdate(
            { raceId },
            { $inc: { totalSol: amountSOL } }, // ✅ Voeg SOL toe
            { new: true, upsert: true } // ✅ Als er geen Vault is, maak er een
        );

        console.log(`✅ [VAULT] Updated Vault: ${updatedVault.totalSol} SOL for race ${raceId}`);

        // ✅ Stuur WebSocket-event naar de UI voor live updates
        sendVaultUpdate(updatedVault);

        return updatedVault;
    } catch (error) {
        console.error("❌ Error updating Vault:", error);
        throw error;
    }
};

/**
 * ✅ **Haalt de Vault-data van een specifieke race op**
 */
export const getVaultByRace = async (req, res) => {
    try {
        const { raceId } = req.params;

        console.log(`[DEBUG] 🔍 Fetching Vault for raceId: ${raceId}`);

        const vault = await Vault.findOne({ raceId });

        if (!vault) {
            console.warn(`[DEBUG] ❌ No Vault found for raceId: ${raceId}`);
            return res.status(404).json({ error: "Vault not found for this race." });
        }

        console.log(`[DEBUG] ✅ Vault found for race ${raceId}: ${vault.totalSol} SOL`);
        res.status(200).json(vault);
    } catch (error) {
        console.error("❌ Error fetching Vault:", error);
        res.status(500).json({ error: "Failed to retrieve Vault data." });
    }
};

/**
 * ✅ Haal de Vault op van de meest recente actieve race
 */
export const getLatestActiveVault = async (req, res) => {
    try {
        console.log("[DEBUG] 🔍 Searching for latest active race...");

        // ✅ Zoek de laatste race die actief is
        const latestActiveRace = await Race.findOne({ status: "active" }).sort({ createdAt: -1 });

        if (!latestActiveRace) {
            console.log("[DEBUG] ❌ No active race found.");
            return res.status(404).json({ message: "No active race found." });
        }

        console.log("[DEBUG] ✅ Found active race:", latestActiveRace);

        const raceId = latestActiveRace.raceId;
        console.log(`[DEBUG] 🔍 Looking for Vault with raceId: ${raceId}`);

        // ✅ Zoek de Vault voor deze actieve race
        const activeVault = await Vault.findOne({ raceId });

        if (!activeVault) {
            console.log(`[DEBUG] ❌ No Vault found for active raceId: ${raceId}`);
            return res.status(404).json({ message: "No Vault found for latest active race." });
        }

        console.log("[DEBUG] ✅ Found Active Vault:", activeVault);

        // ✅ Stuur de Vault terug als JSON
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
 * ✅ Haal de Vault op van de meest recente afgesloten race
 */
export const getLatestVault = async (req, res) => {
    try {
        console.log("[DEBUG] 🔍 Searching for latest closed race...");

        // ✅ Zoek de laatste afgesloten race
        const lastClosedRace = await Race.findOne({ status: "closed" }).sort({ roundEndTime: -1 });

        if (!lastClosedRace) {
            console.log("[DEBUG] ❌ No closed race found.");
            return res.status(404).json({ message: "No closed race found." });
        }

        console.log("[DEBUG] ✅ Found closed race:", lastClosedRace);

        // ✅ Controleer of het juiste `raceId` wordt gebruikt
        const raceId = lastClosedRace.raceId; // Dit moet een string zijn!
        console.log(`[DEBUG] 🔍 Looking for Vault with raceId: ${raceId}`);

        // ✅ Zoek de Vault voor deze race
        const latestVault = await Vault.findOne({ raceId });

        if (!latestVault) {
            console.log(`[DEBUG] ❌ No Vault found for raceId: ${raceId}`);
            return res.status(404).json({ message: "No Vault found for last closed race." });
        }

        console.log("[DEBUG] ✅ Found Vault:", latestVault);

        // ✅ Stuur de Vault terug als JSON
        res.status(200).json({
            raceId: latestVault.raceId,
            totalSol: latestVault.totalSol
        });
    } catch (error) {
        console.error("[ERROR] ❌ Failed to fetch latest vault:", error);
        res.status(500).json({ error: "Failed to fetch latest vault." });
    }
};