const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

const formatIssues = (error) =>
  error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

const validateRequest = (schemas = {}) => (req, _res, next) => {
  try {
    const validated = {};

    if (schemas.body) {
      validated.body = schemas.body.parse(req.body);
      req.body = validated.body;
    }

    if (schemas.params) {
      validated.params = schemas.params.parse(req.params);
      req.params = validated.params;
    }

    if (schemas.query) {
      validated.query = schemas.query.parse(req.query);
    }

    req.validated = {
      ...(req.validated || {}),
      ...validated,
    };

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      next(new AppError("Dữ liệu không hợp lệ", 400, "VALIDATION_ERROR", formatIssues(error)));
      return;
    }

    next(error);
  }
};

module.exports = validateRequest;
