import express from "express";
import { getAllMemes, createMeme, getMemesByIds } from "../controllers/memeController.js";

const router = express.Router();

router.get("/", getAllMemes);

router.post("/byIds", getMemesByIds);

router.post("/", createMeme);

export default router;