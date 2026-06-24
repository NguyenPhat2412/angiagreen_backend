const { z } = require("zod");

const doctorSchedulePayloadSchema = z
  .object({
    doctorId: z.string().trim().min(1).max(120),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: z.string().trim().min(1).max(20),
    endTime: z.string().trim().min(1).max(20),
    type: z.enum(["online", "offline"]),
    isActive: z.boolean().optional(),
    note: z.string().trim().max(500).optional(),
  })
  .strict();

const doctorScheduleUpdateSchema = doctorSchedulePayloadSchema.partial();

module.exports = {
  doctorSchedulePayloadSchema,
  doctorScheduleUpdateSchema,
};
