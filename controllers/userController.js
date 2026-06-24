const asyncHandler = require("../middlewares/asyncHandler");
const PointTransaction = require("../models/PointTransaction");
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
  if (req.body.email) {
    const existingUser = await User.findOne({ email: req.body.email, id: { $ne: req.params.id } }).lean();
    if (existingUser) {
      res.status(409);
      throw new Error("Email already exists");
    }
  }

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

const adjustUserPoints = asyncHandler(async (req, res) => {
  const user = await User.findOne({ id: req.params.id });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const nextPoints = (user.points || 0) + req.body.points;
  if (nextPoints < 0) {
    res.status(400);
    throw new Error("User points cannot be negative");
  }

  user.points = nextPoints;
  await user.save();

  const transaction = await PointTransaction.create({
    userId: user.id,
    points: req.body.points,
    type: req.body.points >= 0 ? "earn" : "redeem",
    reason: req.body.reason,
    referenceType: req.body.referenceType,
    referenceId: req.body.referenceId,
    actorId: req.user.id,
  });

  res.json({ user: toSafeUser(user), transaction });
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
  adjustUserPoints,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
