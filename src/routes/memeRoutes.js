import express from "express";
import { getAllMemes, createMeme, getMemesByIds } from "../controllers/memeController.js";

const router = express.Router();

// ✅ Fetch all memes
router.get("/", getAllMemes);

// ✅ Fetch memes based on a list of meme IDs
router.post("/byIds", getMemesByIds);

// ✅ Add a new meme
router.post("/", createMeme);

export default router;