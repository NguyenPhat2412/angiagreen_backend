const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const doctorScheduleSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `doctor-schedule-${randomUUID()}`, unique: true },
    doctorId: { type: String, required: true, index: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ["online", "offline"], required: true },
    isActive: { type: Boolean, default: true },
    note: String,
  },
  { timestamps: true }
);

doctorScheduleSchema.index({ doctorId: 1, dayOfWeek: 1, startTime: 1 });

module.exports = mongoose.model("DoctorSchedule", doctorScheduleSchema);
