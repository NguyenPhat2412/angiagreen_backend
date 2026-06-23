const express = require("express");
const {
  createDoctor,
  deleteDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
} = require("../controllers/doctorController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { doctorCreateSchema, doctorUpdateSchema } = require("../validations/adminSchemas");
const { doctorListQuerySchema } = require("../validations/contentListSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: doctorListQuerySchema }), getDoctors);
router.post("/", protect, requireRole("admin"), validateRequest({ body: doctorCreateSchema }), createDoctor);
router.get("/:id", validateRequest({ params: idParamSchema }), getDoctorById);
router.put("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema, body: doctorUpdateSchema }), updateDoctor);
router.delete("/:id", protect, requireRole("admin"), validateRequest({ params: idParamSchema }), deleteDoctor);

module.exports = router;
