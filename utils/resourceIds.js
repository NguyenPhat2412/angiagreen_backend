const getLocalizedValue = (value) => {
  if (typeof value === "string") {
    return value;
  }

  return value?.vi || value?.en || value?.zh || "";
};

const slugify = (value, fallback = "item") => {
  const slug = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || `${fallback}-${Date.now()}`;
};

const buildResourceIds = (data, sourceKey, prefix) => {
  const sourceValue = data[sourceKey] || data.name || data.title || data.slug || data.id;
  const base = slugify(getLocalizedValue(sourceValue), prefix);
  const id = data.id ? slugify(data.id, prefix) : base;
  const slug = data.slug ? slugify(data.slug, prefix) : id;

  return { id, slug };
};

module.exports = {
  buildResourceIds,
  getLocalizedValue,
  slugify,
};
