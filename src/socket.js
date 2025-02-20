import { Server } from "socket.io";

let io = null;

/**
 * Initialize WebSocket server.
 * @param {object} server - HTTP server instance
 */
export const initSocket = (server) => {
    if (!server) {
        console.error("[SOCKET] ❌ Cannot initialize WebSocket: No server instance found.");
        return;
    }

    io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`[SOCKET] 🟢 New client connected: ${socket.id}`);

        socket.on("disconnect", () => {
            console.log(`[SOCKET] 🔴 Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

/**
 * Retrieve the WebSocket instance.
 * @returns {object} WebSocket instance (`io`)
 * @throws Error if WebSocket is not initialized
 */
export const getIo = () => {
    if (!io) {
        throw new Error("[SOCKET] ❌ WebSocket is not initialized!");
    }
    return io;
};

/**
 * Emit a WebSocket event with data.
 * @param {string} eventName - Event name
 * @param {object} data - Event payload
 */
export const emitEvent = (eventName, data) => {
    if (!io) {
        console.warn(`[SOCKET] ⚠️ Cannot send event "${eventName}": WebSocket is not initialized.`);
        return;
    }
    io.emit(eventName, data);
};

// **WebSocket event emitters**
export const sendRaceCreated = (race) => emitEvent("raceCreated", race);
export const sendRaceUpdate = (race) => emitEvent("raceUpdate", race);
export const sendRoundUpdate = (round) => emitEvent("roundUpdate", round);
export const sendWinnerUpdate = (winner) => emitEvent("winnerUpdate", winner);
export const sendRaceClosed = (race) => emitEvent("raceClosed", race);