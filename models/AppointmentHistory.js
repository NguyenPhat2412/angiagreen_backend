const { randomUUID } = require("crypto");
const mongoose = require("mongoose");

const appointmentHistorySchema = new mongoose.Schema(
  {
    id: { type: String, default: () => `appointment-history-${randomUUID()}`, unique: true },
    appointmentId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled", "rejected", "rescheduled"],
      required: true,
    },
    note: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("AppointmentHistory", appointmentHistorySchema);
