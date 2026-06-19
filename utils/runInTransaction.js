const mongoose = require("mongoose");

const isTransactionUnsupported = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes("Transaction numbers are only allowed") ||
    message.includes("This MongoDB deployment does not support retryable writes")
  );
};

async function runInTransaction(work) {
  const session = await mongoose.startSession();

  try {
    let result;

    await session.withTransaction(async () => {
      result = await work(session);
    });

    return result;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      return work(null);
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

module.exports = runInTransaction;
