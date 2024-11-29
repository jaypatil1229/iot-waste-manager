import mongoose from "mongoose";

const binCollectionSchema = new mongoose.Schema(
  {
    binId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bin", // Reference to the Bin model
      required: true,
    },
    collectorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collector", // Reference to the Collector model
      required: true,
    },
    collectionDate: {
      type: Date,
      default: Date.now, // Automatically store the date when the bin is collected
    },
    status: {
      type: String,
      enum: ["Collected", "Pending", "Failed"], // Status of the collection
      default: "Collected",
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the model
export default mongoose.models.BinCollection || mongoose.model("BinCollection", binCollectionSchema);