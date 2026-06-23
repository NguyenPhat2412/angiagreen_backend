const asyncHandler = require("../middlewares/asyncHandler");
const Doctor = require("../models/Doctor");
const { slugify } = require("../utils/resourceIds");
const { escapeRegex, getPagination, parseSort, toPaginatedResponse } = require("../utils/query");

const getDoctors = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query, { limit: 12 });
  const filter = {};

  if (query.specialty) {
    const safeSpecialty = escapeRegex(query.specialty);
    filter.$or = [
      { "specialty.vi": { $regex: safeSpecialty, $options: "i" } },
      { "specialty.en": { $regex: safeSpecialty, $options: "i" } },
      { "specialty.zh": { $regex: safeSpecialty, $options: "i" } },
    ];
  }

  if (query.search) {
    const safeSearch = escapeRegex(query.search);
    filter.$or = [
      ...(filter.$or || []),
      { name: { $regex: safeSearch, $options: "i" } },
      { "title.vi": { $regex: safeSearch, $options: "i" } },
      { "title.en": { $regex: safeSearch, $options: "i" } },
      { "specialty.vi": { $regex: safeSearch, $options: "i" } },
      { "specialty.en": { $regex: safeSearch, $options: "i" } },
    ];
  }

  const sort = parseSort(
    query.sort,
    {
      rating: { rating: -1 },
      experience: { experience: -1 },
      newest: { createdAt: -1 },
    },
    { createdAt: 1 }
  );
  const [doctors, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(doctors, { page, limit }, total));
});

const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOne({ id: req.params.id }).lean();
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json(doctor);
});

const createDoctor = asyncHandler(async (req, res) => {
  const id = req.body.id ? slugify(req.body.id, "doctor") : slugify(req.body.name, "doctor");
  const doctor = await Doctor.create({
    ...req.body,
    id,
  });

  res.status(201).json(doctor);
});

const updateDoctor = asyncHandler(async (req, res) => {
  const nextData = { ...req.body };

  if (nextData.id) {
    nextData.id = slugify(nextData.id, "doctor");
  }

  const doctor = await Doctor.findOneAndUpdate({ id: req.params.id }, nextData, {
    new: true,
    runValidators: true,
  }).lean();

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json(doctor);
});

const deleteDoctor = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findOneAndDelete({ id: req.params.id }).lean();

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  createDoctor,
  deleteDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
};
