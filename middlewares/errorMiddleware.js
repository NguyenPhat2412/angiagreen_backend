const notFound = (req, _res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || res.statusCode || 500;
  const safeStatusCode = statusCode === 200 ? 500 : statusCode;
  const response = {
    message: error.message || "Server error",
    requestId: res.getHeader("x-request-id"),
  };

  if (error.code) {
    response.code = error.code;
  }

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && error.stack) {
    response.stack = error.stack;
  }

  res.status(safeStatusCode).json(response);
};

module.exports = { notFound, errorHandler };
