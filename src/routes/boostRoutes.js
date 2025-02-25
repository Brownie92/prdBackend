import express from "express";
import { addBoost } from "../controllers/boostController.js";

const router = express.Router();

// ✅ Boost registratie endpoint
router.post("/", addBoost);

export default router;