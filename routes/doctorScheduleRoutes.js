const express = require("express");
const {
  createDoctorSchedule,
  deleteDoctorSchedule,
  getDoctorSchedules,
  updateDoctorSchedule,
} = require("../controllers/doctorScheduleController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  doctorSchedulePayloadSchema,
  doctorScheduleUpdateSchema,
} = require("../validations/doctorScheduleSchemas");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", getDoctorSchedules);
router.post("/", validateRequest({ body: doctorSchedulePayloadSchema }), createDoctorSchedule);
router.put("/:id", validateRequest({ params: idParamSchema, body: doctorScheduleUpdateSchema }), updateDoctorSchedule);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteDoctorSchedule);

module.exports = router;
