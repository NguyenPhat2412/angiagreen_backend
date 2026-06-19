const asyncHandler = require("../middlewares/asyncHandler");
const User = require("../models/User");
const toSafeUser = require("../utils/toSafeUser");
const { escapeRegex, getPagination, toPaginatedResponse } = require("../utils/query");

const getAllUsers = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const search = query.search;
  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
      { phone: { $regex: safeSearch, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(users.map(toSafeUser), { page, limit }, total));
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.params.id }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(toSafeUser(user));
});

const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(toSafeUser(user));
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json(toSafeUser(user));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ id: req.params.id });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({ id: req.params.id });
});

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
