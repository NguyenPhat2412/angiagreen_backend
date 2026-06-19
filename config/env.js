const getEnv = (key, fallback = "") => {
  const value = process.env[key];
  return value === undefined || value === "" ? fallback : value;
};

const requireEnv = (key) => {
  const value = getEnv(key);

  if (!value) {
    const error = new Error(`Missing required environment variable: ${key}`);
    error.statusCode = 500;
    throw error;
  }

  return value;
};

const getNumberEnv = (key, fallback) => {
  const value = Number(getEnv(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
};

const getBooleanEnv = (key, fallback = false) => {
  const value = getEnv(key);

  if (!value) {
    return fallback;
  }

  return ["1", "true", "yes"].includes(value.toLowerCase());
};

const getAllowedOrigins = () =>
  getEnv("ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = {
  getAllowedOrigins,
  getBooleanEnv,
  getEnv,
  getNumberEnv,
  requireEnv,
};
