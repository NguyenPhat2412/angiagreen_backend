const mongoSanitize = require("express-mongo-sanitize");

const sanitizeTarget = (target) => {
  if (target && typeof target === "object") {
    mongoSanitize.sanitize(target, { replaceWith: "_" });
  }
};

const sanitizeRequest = (req, _res, next) => {
  // Sanitize in place so this works cleanly with Express 5's query getter.
  sanitizeTarget(req.body);
  sanitizeTarget(req.params);
  sanitizeTarget(req.query);
  next();
};

module.exports = sanitizeRequest;
