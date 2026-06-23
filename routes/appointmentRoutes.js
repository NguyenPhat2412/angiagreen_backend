const express = require("express");
const {
  getAllAppointments,
  getMyAppointments,
  createAppointment,
  updateAppointment,
} = require("../controllers/appointmentController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  appointmentBodySchema,
  appointmentListQuerySchema,
} = require("../validations/appointmentSchemas");
const {
  appointmentAdminQuerySchema,
  appointmentAdminUpdateSchema,
} = require("../validations/adminSchemas");
const { idParamSchema } = require("../validations/commonSchemas");

const router = express.Router();

router.get("/", protect, requireRole("admin"), validateRequest({ query: appointmentAdminQuerySchema }), getAllAppointments);
router.get("/my", protect, validateRequest({ query: appointmentListQuerySchema }), getMyAppointments);
router.post("/", protect, validateRequest({ body: appointmentBodySchema }), createAppointment);
router.patch("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: appointmentAdminUpdateSchema }), updateAppointment);

module.exports = router;
