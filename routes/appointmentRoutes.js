const express = require("express");
const {
  getMyAppointments,
  createAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const {
  appointmentBodySchema,
  appointmentListQuerySchema,
} = require("../validations/appointmentSchemas");

const router = express.Router();

router.get("/my", protect, validateRequest({ query: appointmentListQuerySchema }), getMyAppointments);
router.post("/", protect, validateRequest({ body: appointmentBodySchema }), createAppointment);

module.exports = router;
