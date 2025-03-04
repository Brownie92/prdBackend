import express from "express";
import { getVaultByRace, getLatestVault, getLatestActiveVault } from "../controllers/vaultController.js";

const router = express.Router();

router.get("/latest", getLatestVault); 

router.get("/active", getLatestActiveVault);

router.get("/:raceId", getVaultByRace);

export default router;