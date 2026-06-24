const express = require("express");
const {
  createRole,
  createRolePermission,
  createUserRole,
  getRoles,
  getRolePermissions,
  getUserRoles,
  updateRole,
  updateRolePermission,
  updateUserRole,
} = require("../controllers/rbacController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema } = require("../validations/commonSchemas");
const {
  rbacQuerySchema,
  rolePayloadSchema,
  rolePermissionPayloadSchema,
  rolePermissionUpdateSchema,
  roleUpdateSchema,
  userRolePayloadSchema,
  userRoleUpdateSchema,
} = require("../validations/rbacSchemas");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/roles", validateRequest({ query: rbacQuerySchema }), getRoles);
router.post("/roles", validateRequest({ body: rolePayloadSchema }), createRole);
router.put("/roles/:id", validateRequest({ params: idParamSchema, body: roleUpdateSchema }), updateRole);

router.get("/user-roles", validateRequest({ query: rbacQuerySchema }), getUserRoles);
router.post("/user-roles", validateRequest({ body: userRolePayloadSchema }), createUserRole);
router.put("/user-roles/:id", validateRequest({ params: idParamSchema, body: userRoleUpdateSchema }), updateUserRole);

router.get("/role-permissions", validateRequest({ query: rbacQuerySchema }), getRolePermissions);
router.post("/role-permissions", validateRequest({ body: rolePermissionPayloadSchema }), createRolePermission);
router.put("/role-permissions/:id", validateRequest({ params: idParamSchema, body: rolePermissionUpdateSchema }), updateRolePermission);

module.exports = router;
