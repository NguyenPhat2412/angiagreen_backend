const toSafeUser = (user) => {
  const value = typeof user.toObject === "function" ? user.toObject() : user;
  delete value.password;
  delete value.__v;
  delete value._id;
  return value;
};

module.exports = toSafeUser;
