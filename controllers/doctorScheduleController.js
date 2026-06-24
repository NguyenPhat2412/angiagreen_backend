const asyncHandler = require("../middlewares/asyncHandler");
const Doctor = require("../models/Doctor");
const DoctorSchedule = require("../models/DoctorSchedule");

const getDoctorSchedules = asyncHandler(async (req, res) => {
  const filter = req.query.doctorId ? { doctorId: req.query.doctorId } : {};
  const schedules = await DoctorSchedule.find(filter).sort({ doctorId: 1, dayOfWeek: 1, startTime: 1 }).lean();
  res.json(schedules);
});

const createDoctorSchedule = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ id: req.body.doctorId }).lean();
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  const schedule = await DoctorSchedule.create(req.body);
  res.status(201).json(schedule);
});

const updateDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await DoctorSchedule.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!schedule) {
    res.status(404);
    throw new Error("Doctor schedule not found");
  }

  res.json(schedule);
});

const deleteDoctorSchedule = asyncHandler(async (req, res) => {
  const schedule = await DoctorSchedule.findOneAndDelete({ id: req.params.id }).lean();

  if (!schedule) {
    res.status(404);
    throw new Error("Doctor schedule not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  createDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedules,
  updateDoctorSchedule,
};
