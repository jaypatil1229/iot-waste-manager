import mongoose from 'mongoose';

const {Schema , model} = mongoose;

const binSchema = new Schema({
    binId: { type: String, required: true },
    pin: { type: String, required: true},
    capacity: { type: Number, required: true },
    defaultCity: { type: String, required: true},
    location: {
        latitude: { type: String},
        longitude: { type: String},
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    isFull: { type: Boolean, default: false },
});

export default mongoose.models?.Bin || model("Bin", binSchema);
