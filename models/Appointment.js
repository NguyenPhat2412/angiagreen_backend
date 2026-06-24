const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `appointment-${randomUUID()}`, unique: true },
    userId: { type: String, required: true, index: true },
    doctorId: String,
    doctorName: String,
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, enum: ["online", "offline", "phone", "video", "chat"], required: true },
    topic: String,
    contactName: String,
    contactPhone: String,
    contactEmail: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected", "rescheduled"],
      default: "pending",
    },
    rescheduledFrom: {
      date: String,
      time: String,
    },
    rejectionReason: String,
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
