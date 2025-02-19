import mongoose from "mongoose";

const memeSchema = new mongoose.Schema({
    memeId: { type: String, unique: true, default: function () { return this._id.toString(); } }, // ✅ memeId = ObjectId
    name: { type: String, required: true },
    url: { type: String, required: true },
  });

// Before saving, set `memeId` to match the `_id` (ObjectId)
memeSchema.pre("save", function (next) {
  if (!this.memeId) {
    this.memeId = this._id.toString();
  }
  next();
});

const Meme = mongoose.model("Meme", memeSchema);
export default Meme;