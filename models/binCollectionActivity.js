import mongoose from "mongoose";
const { Schema, model } = mongoose;

const binCollectionActivitySchema = new Schema({
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  binId: { type: mongoose.Schema.Types.ObjectId, ref: "Bin" },
  status: {
    type: String,
    enum: ["processing", "collected", "rejected"],
    default: "processing",
  },
  collectedAt: { type: Date }, // Null until collected
});

export default mongoose.models?.BinCollectionActivity ||
  model("BinCollectionActivity", binCollectionActivitySchema);
