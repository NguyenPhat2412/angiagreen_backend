const { z } = require("zod");

const createVNPayUrlSchema = z
  .object({
    orderId: z.string().trim().min(1).max(120),
    returnUrl: z.string().trim().url(),
  })
  .strict();

const verifyVNPaySchema = z
  .object({
    vnp_TxnRef: z.string().trim().min(1),
    vnp_ResponseCode: z.string().trim().optional(),
    vnp_SecureHash: z.string().trim().min(1),
  })
  .passthrough();

module.exports = {
  createVNPayUrlSchema,
  verifyVNPaySchema,
};
