const asyncHandler = require("../middlewares/asyncHandler");
const Role = require("../models/Role");
const RolePermission = require("../models/RolePermission");
const UserRole = require("../models/UserRole");
const { getPagination, toPaginatedResponse } = require("../utils/query");

const getUserRoles = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.userId) filter.userId = query.userId;
  if (query.roleId) filter.roleId = query.roleId;
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    UserRole.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    UserRole.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

const getRoles = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Role.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Role.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

const createRole = asyncHandler(async (req, res) => {
  const role = await Role.create(req.body);
  res.status(201).json(role);
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!role) {
    res.status(404);
    throw new Error("Role not found");
  }

  res.json(role);
});

const createUserRole = asyncHandler(async (req, res) => {
  const userRole = await UserRole.create({
    ...req.body,
    assignedBy: req.user.id,
    assignedAt: new Date(),
  });

  res.status(201).json(userRole);
});

const updateUserRole = asyncHandler(async (req, res) => {
  const update = { ...req.body };

  if (update.status === "inactive") {
    update.revokedBy = req.user.id;
    update.revokedAt = new Date();
  }

  const userRole = await UserRole.findOneAndUpdate({ id: req.params.id }, update, {
    new: true,
    runValidators: true,
  }).lean();

  if (!userRole) {
    res.status(404);
    throw new Error("UserRole not found");
  }

  res.json(userRole);
});

const getRolePermissions = asyncHandler(async (req, res) => {
  const query = req.validated?.query || {};
  const { page, limit, skip } = getPagination(query);
  const filter = {};

  if (query.roleId) filter.roleId = query.roleId;
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    RolePermission.find(filter).sort({ roleId: 1, permissionKey: 1 }).skip(skip).limit(limit).lean(),
    RolePermission.countDocuments(filter),
  ]);

  res.json(toPaginatedResponse(items, { page, limit }, total));
});

const createRolePermission = asyncHandler(async (req, res) => {
  const rolePermission = await RolePermission.create(req.body);
  res.status(201).json(rolePermission);
});

const updateRolePermission = asyncHandler(async (req, res) => {
  const rolePermission = await RolePermission.findOneAndUpdate({ id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!rolePermission) {
    res.status(404);
    throw new Error("RolePermission not found");
  }

  res.json(rolePermission);
});

module.exports = {
  createRole,
  createRolePermission,
  createUserRole,
  getRoles,
  getRolePermissions,
  getUserRoles,
  updateRole,
  updateRolePermission,
  updateUserRole,
};
