const express = require("express");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { protect, requireRole } = require("../middlewares/authMiddleware");
const validateRequest = require("../middlewares/validateRequest");
const { idParamSchema, paginationQuerySchema } = require("../validations/commonSchemas");
const { adminCreateUserSchema, adminUpdateUserSchema } = require("../validations/userSchemas");

const router = express.Router();

router.use(protect, requireRole("admin"));

router.get("/", validateRequest({ query: paginationQuerySchema }), getAllUsers);
router.post("/", validateRequest({ body: adminCreateUserSchema }), createUser);
router.get("/:id", validateRequest({ params: idParamSchema }), getUserById);
router.put("/:id", validateRequest({ params: idParamSchema, body: adminUpdateUserSchema }), updateUser);
router.delete("/:id", validateRequest({ params: idParamSchema }), deleteUser);

module.exports = router;
