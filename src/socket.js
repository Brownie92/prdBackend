import { WebSocketServer } from "ws";
import http from "http";

let wss = null; // ✅ WebSocket Server instance

/**
 * Initialize WebSocket server.
 * @param {object} server - HTTP server instance
 */
export const initSocket = (server) => {
    if (!server) {
        console.error("[WS] ❌ Cannot initialize WebSocket: No server instance found.");
        return;
    }

    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("[WS] 🟢 New client connected");

        ws.on("message", (message) => {
            console.log(`[WS] 📩 Received: ${message}`);
        });

        ws.on("close", (code, reason) => {
            console.log(`[WS] 🔴 Client disconnected. Code: ${code}, Reason: ${reason}`);
        });

        ws.on("error", (error) => {
            console.error(`[WS] ❌ WebSocket error:`, error);
        });

        ws.send(JSON.stringify({ event: "connection", data: "Connection established!" }));
    });

    return wss;
};

/**
 * Retrieve the WebSocket Server instance.
 * @returns {object} WebSocket Server (`wss`)
 * @throws Error if WebSocket is not initialized
 */
export const getIo = () => {
    if (!wss) {
        throw new Error("[WS] ❌ WebSocket is not initialized!");
    }
    return wss;
};

/**
 * Emit a WebSocket event with data to all connected clients.
 * @param {string} eventName - Event name
 * @param {object} data - Event payload
 */
export const emitEvent = (eventName, data) => {
    if (!wss) {
        console.warn(`[WS] ⚠️ Cannot send event "${eventName}": WebSocket is not initialized.`);
        return;
    }
    const payload = JSON.stringify({ event: eventName, data });
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // ✅ Alleen actieve verbindingen
            client.send(payload);
        }
    });
};

// **WebSocket event emitters**
export const sendRaceCreated = (race) => emitEvent("raceCreated", race);
export const sendRaceUpdate = (race) => emitEvent("raceUpdate", race);
export const sendRoundUpdate = (round) => emitEvent("roundUpdate", round);
export const sendWinnerUpdate = (winner) => emitEvent("winnerUpdate", winner);
export const sendRaceClosed = (race) => emitEvent("raceClosed", race);