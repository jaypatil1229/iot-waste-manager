import mongoose from "mongoose";
const { Schema, model } = mongoose;

const collectionRouteSchema = new Schema({
  collectorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  start: { type: String, required: true },
  end: { type: String, required: true },
  bins: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bin" }], // List of bins in route
  createdAt: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
});

export default mongoose.models?.CollectionRoute ||
  model("CollectionRoute", collectionRouteSchema);
