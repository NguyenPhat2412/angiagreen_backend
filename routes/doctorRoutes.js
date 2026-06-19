const express = require("express");
const { getDoctors, getDoctorById } = require("../controllers/doctorController");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const { doctorListQuerySchema } = require("../validations/contentListSchemas");

const router = express.Router();

router.get("/", validateRequest({ query: doctorListQuerySchema }), getDoctors);
router.get("/:id", validateRequest({ params: idParamSchema }), getDoctorById);

module.exports = router;
