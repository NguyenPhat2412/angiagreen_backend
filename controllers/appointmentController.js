const asyncHandler = require("../middlewares/asyncHandler");
const Appointment = require("../models/Appointment");
const AppointmentHistory = require("../models/AppointmentHistory");
const Doctor = require("../models/Doctor");
const { createNotificationOnce } = require("../utils/notifications");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");
const runInTransaction = require("../utils/runInTransaction");

const getMyAppointments = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);

  const [appointments, total] = await Promise.all([
    Appointment.find({ userId: req.user.id }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Appointment.countDocuments({ userId: req.user.id }),
  ]);

  res.json(toPaginatedResponse(appointments, { page, limit }, total));
});

const getAllAppointments = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.doctorId) {
    filter.doctorId = query.doctorId;
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      { id: { $regex: safeSearch, $options: "i" } },
      { userId: { $regex: safeSearch, $options: "i" } },
      { doctorName: { $regex: safeSearch, $options: "i" } },
      { contactName: { $regex: safeSearch, $options: "i" } },
      { contactPhone: { $regex: safeSearch, $options: "i" } },
      { contactEmail: { $regex: safeSearch, $options: "i" } },
      { topic: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Appointment.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(appointments, { page, limit }, total));
});

const createAppointment = asyncHandler(async (req, res) => {
  const appointment = await runInTransaction(async (session) => {
    const doctor = req.body.doctorId
      ? await Doctor.findOne({ id: req.body.doctorId }).session(session || null).lean()
      : null;

    const [createdAppointment] = await Appointment.create(
      [
        {
          userId: req.user.id,
          doctorId: req.body.doctorId,
          doctorName: doctor?.name,
          date: req.body.date,
          time: req.body.time,
          type: req.body.type,
          topic: req.body.topic,
          contactName: req.body.contactName,
          contactPhone: req.body.contactPhone,
          contactEmail: req.body.contactEmail,
          note: req.body.note,
        },
      ],
      { session }
    );

    await AppointmentHistory.create(
      [
        {
          appointmentId: createdAppointment.id,
          status: "pending",
          note: "Lịch tư vấn đã được tạo",
        },
      ],
      { session }
    );

    await createNotificationOnce(
      {
        userId: req.user.id,
        eventKey: `appointment-created:${createdAppointment.id}`,
        title: {
          vi: "Đặt lịch thành công",
          en: "Appointment booked",
          zh: "预约已创建",
        },
        content: {
          vi: "Yêu cầu tư vấn của bạn đã được ghi nhận.",
          en: "Your consultation request has been recorded.",
          zh: "您的咨询请求已记录。",
        },
        type: "appointment",
        relatedId: createdAppointment.id,
      },
      session
    );

    return createdAppointment.toObject();
  });

  res.status(201).json(appointment);
});

const updateAppointment = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.doctorId) {
    const doctor = await Doctor.findOne({ id: nextData.doctorId }).lean();
    nextData.doctorName = doctor?.name;
  }

  const appointment = await Appointment.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!appointment) {
    res.status(404);
    throw new Error("Appointment not found");
  }

  if (nextData.status) {
    await AppointmentHistory.create({
      appointmentId: appointment.id,
      status: nextData.status,
      note: nextData.note || "Updated by admin",
    });
  }

  res.json(appointment);
});

module.exports = {
  createAppointment,
  getAllAppointments,
  getMyAppointments,
  updateAppointment,
};
