import dotenv from "dotenv";
import axios from "axios";  // Gebruik axios voor eenvoudiger API-calls

dotenv.config();

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:6001"; // Zorg dat deze in .env staat

const startRace = async () => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/races`, {}, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("✅ Race started successfully:", response.data);
    } catch (error) {
        console.error("❌ Error starting race:", error.response?.data || error.message);
    }
};

// ✅ Start the script
startRace();