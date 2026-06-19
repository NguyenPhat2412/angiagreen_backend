const asyncHandler = require("../middlewares/asyncHandler");
const Doctor = require("../models/Doctor");
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

module.exports = { getDoctors, getDoctorById };
