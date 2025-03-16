import { WebSocketServer } from "ws";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

let wss = null;
const WS_PORT = process.env.WS_PORT || 6001;
const ALLOWED_ORIGINS = process.env.WS_ALLOWED_ORIGINS ? process.env.WS_ALLOWED_ORIGINS.split(",") : [];

export const initSocket = (server) => {
    if (!server) {
        wss = new WebSocketServer({ port: WS_PORT });
    } else {
        wss = new WebSocketServer({ server });
    }

    wss.on("connection", (ws, req) => {
        const origin = req.headers.origin;
        
        if (ALLOWED_ORIGINS.length > 0 && !ALLOWED_ORIGINS.includes(origin)) {
            ws.close(1008, "Origin not allowed");
            return;
        }

        ws.on("message", (message) => {
            try {
                const data = JSON.parse(message);
                // Handle messages if needed
            } catch (error) {
                ws.send(JSON.stringify({ event: "error", data: "Invalid message format" }));
            }
        });

        ws.on("close", () => {
            // Handle disconnections cleanly
        });

        ws.on("error", (error) => {
            // Log errors silently
        });

        ws.send(JSON.stringify({ event: "connection", data: "Connection established!" }));
    });

    return wss;
};

export const getIo = () => {
    if (!wss) {
        throw new Error("WebSocket is not initialized!");
    }
    return wss;
};

export const emitEvent = (eventName, data) => {
    if (!wss) {
        return;
    }
    const payload = JSON.stringify({ event: eventName, data });
    wss.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(payload);
        }
    });
};

export const sendRaceCreated = (race) => emitEvent("raceCreated", race);
export const sendRaceUpdate = (race) => emitEvent("raceUpdate", race);
export const sendRoundUpdate = (round) => emitEvent("roundUpdate", round);
export const sendWinnerUpdate = (winner) => emitEvent("winnerUpdate", winner);
export const sendRaceClosed = (race) => emitEvent("raceClosed", race);
export const sendVaultUpdate = (vaultData) => emitEvent("vaultUpdate", vaultData);
export const sendBoostUpdate = (boostData) => {
    const formattedBoosts = boostData.boosts.map(boost => ({
        ...boost,
        memeId: String(boost.memeId)
    }));

    emitEvent("boostUpdate", { ...boostData, boosts: formattedBoosts });
};
