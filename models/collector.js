import mongoose from "mongoose";
const {Schema, model} = mongoose;

const collectorSchema = new Schema({
  name: { type: String, required: true },
  isAdmin: { type: Boolean, default: false},
  city: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  binsCollected: {type:Number , default: 0},
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Collector || model('Collector', collectorSchema);

