import mongoose from "mongoose";

const { Schema, model } = mongoose;

const binSchema = new Schema({
  binId: { type: String, required: true },
  pin: { type: String, required: true },
  capacity: { type: Number, required: true },
  defaultCity: { type: String, required: true },
  location: {
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isFull: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["empty", "full", "processing"], // "processing" = assigned for collection
    default: "empty",
  },
});

export default mongoose.models?.Bin || model("Bin", binSchema);
