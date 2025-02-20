import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    raceId: { type: String, required: true, index: true }, // ✅ Race the participant is competing in
    walletAddress: { type: String, required: true, index: true }, // ✅ Participant's wallet address
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: "Meme", required: true }, // ✅ Chosen meme
    hasVotedInRounds: { type: [Number], default: [] } // ✅ List of rounds in which the participant has already voted
}, { timestamps: true });

const Participant = mongoose.model("Participant", participantSchema);
export default Participant;