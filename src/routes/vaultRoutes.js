import express from "express";
import { getVaultByRace, getLatestVault } from "../controllers/vaultController.js";

const router = express.Router();

router.get("/latest", getLatestVault); 

router.get("/:raceId", getVaultByRace);

export default router;