const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPagination = (query = {}, defaults = {}) => {
  const maxLimit = defaults.maxLimit || 100;
  const page = Math.max(1, Number(query.page) || defaults.page || 1);
  const requestedLimit = Number(query.limit) || defaults.limit || 20;
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const toPaginatedResponse = (items, { page, limit }, total) => ({
  items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});

const parseSort = (value, allowedSorts, fallbackSort) => {
  if (!value) {
    return fallbackSort;
  }

  return allowedSorts[value] || fallbackSort;
};

module.exports = {
  escapeRegex,
  getPagination,
  parseSort,
  toPaginatedResponse,
};
