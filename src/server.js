import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { initSocket, sendRaceCreated, sendRaceUpdate, sendRoundUpdate, sendWinnerUpdate } from "./socket.js";

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SERVER_HOST = process.env.SERVER_HOST || "0.0.0.0";

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("[INFO] Connected to MongoDB"))
  .catch((err) => {
    console.error("[ERROR] MongoDB connection failed:", err);
    process.exit(1);
  });

// Initialize WebSocket and store reference
const io = initSocket(server);
if (!io) {
    console.error("[ERROR] WebSocket initialization failed!");
} else {
    console.log("[INFO] WebSocket successfully initialized!");
}

// Import API routes
import memeRoutes from "./routes/memeRoutes.js";
import raceRoutes from "./routes/raceRoutes.js";
import roundRoutes from "./routes/roundRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import boostRoutes from "./routes/boostRoutes.js";
import vaultRoutes from "./routes/vaultRoutes.js";

app.use("/api/memes", memeRoutes);
app.use("/api/races", raceRoutes);
app.use("/api/rounds", roundRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/winners", winnerRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/vaults", vaultRoutes);

// Fallback route for 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start the round scheduler
import "./schedulers/roundScheduler.js";

// Start the server
server.listen(PORT, SERVER_HOST, () => {
  console.log(`[INFO] Server is running on http://${SERVER_HOST}:${PORT}`);
});

// Export WebSocket events
export { io, sendRaceCreated, sendRaceUpdate, sendRoundUpdate, sendWinnerUpdate };