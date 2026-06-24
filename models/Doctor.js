const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    specialty: { type: mongoose.Schema.Types.Mixed, required: true },
    experience: { type: Number, required: true },
    image: { type: String, required: true },
    consultationType: [{ type: String, enum: ["online", "offline"] }],
    workingHours: [
      {
        dayOfWeek: { type: Number, min: 0, max: 6 },
        startTime: String,
        endTime: String,
        type: { type: String, enum: ["online", "offline"] },
        isActive: { type: Boolean, default: true },
      },
    ],
    nextAvailable: String,
    rating: Number,
  },
  { timestamps: true }
);

doctorSchema.index({ createdAt: 1 });
doctorSchema.index({ rating: -1 });

module.exports = mongoose.model("Doctor", doctorSchema);
