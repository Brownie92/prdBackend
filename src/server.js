import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { initSocket, sendRaceCreated, sendRaceUpdate, sendRoundUpdate, sendWinnerUpdate } from "./socket.js";
import ipWhitelistMiddleware from "./middlewares/ipWhitelist.js";

const app = express();
app.set("trust proxy", true);

const server = http.createServer(app);
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
const SERVER_HOST = process.env.SERVER_HOST;

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [];

if (!MONGO_URI) {
  console.error("[ERROR] MONGO_URI is not defined in the environment variables.");
  process.exit(1);
}

app.use(cors({
  origin: (origin, callback) => {
    console.log(`[CORS] Incoming request from: ${origin}`);

    // 🛑 Blokkeer alleen als het een EXTERNE request is zonder origin
    if (!origin) {
      console.warn("[CORS] ⚠️ Allowing request without origin (likely internal request)");
      return callback(null, true); // Sta interne requests toe
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      console.error(`[CORS] ❌ Blocked request from origin: ${origin}`);
      return callback(new Error("CORS policy does not allow this origin"));
    }
  },
  credentials: true,
}));

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
const io = initSocket(null, allowedOrigins);
if (!io) {
    console.error("[ERROR] WebSocket initialization failed!");
}

// Import API routes
import memeRoutes from "./routes/memeRoutes.js";
import raceRoutes from "./routes/raceRoutes.js";
import roundRoutes from "./routes/roundRoutes.js";
import participantRoutes from "./routes/participantRoutes.js";
import winnerRoutes from "./routes/winnerRoutes.js";
import boostRoutes from "./routes/boostRoutes.js";
import vaultRoutes from "./routes/vaultRoutes.js";

app.use("/api/memes", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.mehtod === "DELETE") {
    return  ipWhitelistMiddleware(req, res, next);
  }
}, memeRoutes);
app.use("/api/races", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
    return ipWhitelistMiddleware(req, res, next);
  }
  next();
}, raceRoutes);
app.use("/api/rounds", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
    return ipWhitelistMiddleware(req, res, next);
  }
  next();
}, roundRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/winners", (req, res, next) => {
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH" || req.method === "DELETE") {
    return ipWhitelistMiddleware(req, res, next);
  }
  next();
}, winnerRoutes);
app.use("/api/boosts", boostRoutes);
app.use("/api/vaults", vaultRoutes);

// Fallback route for 404 errors
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const errorResponse = { message: "Internal Server Error" };
  if (process.env.NODE_ENV !== 'production') {
    errorResponse.error = err.message;
  }
  res.status(500).json(errorResponse);
});

// Start the round scheduler
import "./schedulers/roundScheduler.js";

// Start the server
server.listen(PORT, SERVER_HOST, () => {
  console.log(`[INFO] Server is running on http://${SERVER_HOST}:${PORT}`);
});

// Export WebSocket events
export { io, sendRaceCreated, sendRaceUpdate, sendRoundUpdate, sendWinnerUpdate };
