const { z } = require("zod");
const { paginationQuerySchema } = require("./commonSchemas");

const appointmentBodySchema = z
  .object({
    doctorId: z.string().trim().max(120).optional(),
    date: z.string().trim().min(1).max(40),
    time: z.string().trim().min(1).max(40),
    type: z.enum(["online", "offline", "phone", "video", "chat"]),
    topic: z.string().trim().max(200).optional(),
    contactName: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(20).optional(),
    contactEmail: z.string().trim().email().max(255).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

module.exports = {
  appointmentBodySchema,
  appointmentListQuerySchema: paginationQuerySchema,
};
