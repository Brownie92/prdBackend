import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    raceId: { type: String, required: true, unique: true, index: true }, 
    memeId: { type: mongoose.Schema.Types.ObjectId, ref: "Meme", required: true }, 
    memeUrl: { type: String, required: true },
    progress: { type: Number, required: true },
  },
  { timestamps: true }
);

const Winner = mongoose.model("Winner", winnerSchema);
export default Winner;