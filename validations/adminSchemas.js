const { z } = require("zod");
const { paginationQuerySchema, addressSchema } = require("./commonSchemas");

const localizedTextSchema = z
  .object({
    vi: z.string().trim().min(1).max(5000),
    en: z.string().trim().min(1).max(5000),
    zh: z.string().trim().min(1).max(5000),
  })
  .strict();

const optionalLocalizedTextSchema = z
  .object({
    vi: z.string().trim().max(5000).optional(),
    en: z.string().trim().max(5000).optional(),
    zh: z.string().trim().max(5000).optional(),
  })
  .strict();

const localizedListSchema = z
  .object({
    vi: z.array(z.string().trim().min(1).max(500)).default([]),
    en: z.array(z.string().trim().min(1).max(500)).default([]),
    zh: z.array(z.string().trim().min(1).max(500)).default([]),
  })
  .strict();

const productTraceabilitySchema = z
  .object({
    qrCode: z.string().trim().max(500).optional(),
    batch: z.string().trim().max(120).optional(),
    productionDate: z.string().trim().max(40).optional(),
    expiryDate: z.string().trim().max(40).optional(),
    region: z.string().trim().max(200).optional(),
    timeline: z
      .array(
        z
          .object({
            date: z.string().trim().max(40),
            event: localizedTextSchema,
          })
          .strict()
      )
      .optional(),
  })
  .strict();

const productPayloadSchema = z
  .object({
    id: z.string().trim().max(120).optional(),
    name: localizedTextSchema,
    slug: z.string().trim().max(160).optional(),
    categoryId: z.string().trim().min(1).max(120),
    price: z.coerce.number().min(0),
    originalPrice: z.coerce.number().min(0).optional(),
    discount: z.coerce.number().min(0).max(100).optional(),
    image: z.string().trim().min(1).max(1000),
    images: z.array(z.string().trim().min(1).max(1000)).optional(),
    description: localizedTextSchema,
    shortDescription: localizedTextSchema.optional(),
    benefits: localizedListSchema.optional(),
    usage: localizedTextSchema.optional(),
    attributes: z.record(z.string().trim().max(80), z.string().trim().max(500)).optional(),
    origin: z.string().trim().max(200).optional(),
    certifications: z.array(z.string().trim().min(1).max(120)).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    soldCount: z.coerce.number().int().min(0).optional(),
    inStock: z.boolean().optional(),
    traceability: productTraceabilitySchema.optional(),
  })
  .strict();

const categoryPayloadSchema = z
  .object({
    id: z.string().trim().max(120).optional(),
    name: localizedTextSchema,
    slug: z.string().trim().max(160).optional(),
    icon: z.string().trim().min(1).max(80),
    description: localizedTextSchema.optional(),
  })
  .strict();

const articlePayloadSchema = z
  .object({
    id: z.string().trim().max(120).optional(),
    title: localizedTextSchema,
    slug: z.string().trim().max(160).optional(),
    excerpt: localizedTextSchema,
    content: localizedTextSchema.optional(),
    image: z.string().trim().min(1).max(1000),
    category: z.string().trim().min(1).max(120),
    tags: z.array(z.string().trim().min(1).max(80)).optional(),
    publishedAt: z.string().trim().max(80).optional(),
    author: z.string().trim().max(120).optional(),
    status: z.enum(["draft", "published"]).optional(),
  })
  .strict();

const doctorPayloadSchema = z
  .object({
    id: z.string().trim().max(120).optional(),
    name: z.string().trim().min(1).max(160),
    title: localizedTextSchema,
    specialty: localizedTextSchema,
    experience: z.coerce.number().int().min(0).max(80),
    image: z.string().trim().min(1).max(1000),
    consultationType: z.array(z.enum(["online", "offline"])).default([]),
    nextAvailable: z.string().trim().max(120).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
  })
  .strict();

const membershipPackagePayloadSchema = z
  .object({
    id: z.string().trim().max(120).optional(),
    name: localizedTextSchema,
    price: z.coerce.number().min(0),
    description: localizedTextSchema,
    benefits: z.array(localizedTextSchema).default([]),
    image: z.string().trim().min(1).max(1000),
    featured: z.boolean().optional(),
  })
  .strict();

const contentHighlightSchema = z
  .object({
    label: localizedTextSchema,
    value: z.string().trim().min(1).max(120),
  })
  .strict();

const contentActionSchema = z
  .object({
    label: localizedTextSchema,
    href: z.string().trim().min(1).max(500),
    variant: z.enum(["default", "outline", "secondary"]).optional(),
  })
  .strict();

const contentSectionSchema = z
  .object({
    heading: localizedTextSchema,
    body: optionalLocalizedTextSchema.optional(),
    icon: z.string().trim().max(80).optional(),
    items: z.array(localizedTextSchema).optional(),
  })
  .strict();

const contentCardSchema = z
  .object({
    title: localizedTextSchema,
    text: localizedTextSchema,
    icon: z.string().trim().max(80).optional(),
  })
  .strict();

const contentFaqSchema = z
  .object({
    question: localizedTextSchema,
    answer: localizedTextSchema,
  })
  .strict();

const contentJobSchema = z
  .object({
    title: localizedTextSchema,
    location: localizedTextSchema,
    type: z.string().trim().min(1).max(80),
    applyEmail: z.string().trim().email().max(255).optional(),
  })
  .strict();

const contentPagePayloadSchema = z
  .object({
    key: z.string().trim().min(1).max(160),
    group: z.enum(["policy", "support", "career", "marketing"]),
    title: localizedTextSchema,
    description: localizedTextSchema,
    badge: z.string().trim().max(120).optional(),
    icon: z.string().trim().max(80).optional(),
    imageUrl: z.string().trim().max(1000).optional(),
    order: z.coerce.number().int().min(0).optional(),
    status: z.enum(["draft", "published"]).optional(),
    highlights: z.array(contentHighlightSchema).optional(),
    actions: z.array(contentActionSchema).optional(),
    sections: z.array(contentSectionSchema).optional(),
    cards: z.array(contentCardSchema).optional(),
    faqs: z.array(contentFaqSchema).optional(),
    jobs: z.array(contentJobSchema).optional(),
  })
  .strict();

const orderAdminQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
});

const orderAdminUpdateSchema = z
  .object({
    status: z.enum(["pending", "confirmed", "shipping", "delivered", "cancelled"]).optional(),
    paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
    transactionNo: z.string().trim().max(120).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

const appointmentAdminQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
  doctorId: z.string().trim().max(120).optional(),
});

const appointmentAdminUpdateSchema = z
  .object({
    doctorId: z.string().trim().max(120).optional(),
    date: z.string().trim().min(1).max(40).optional(),
    time: z.string().trim().min(1).max(40).optional(),
    type: z.enum(["online", "offline", "phone", "video", "chat"]).optional(),
    topic: z.string().trim().max(200).optional(),
    contactName: z.string().trim().max(120).optional(),
    contactPhone: z.string().trim().max(20).optional(),
    contactEmail: z.string().trim().email().max(255).optional(),
    status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

const membershipOrderAdminQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["pending", "completed", "cancelled"]).optional(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
});

const membershipOrderAdminUpdateSchema = z
  .object({
    status: z.enum(["pending", "completed", "cancelled"]).optional(),
    paymentStatus: z.enum(["unpaid", "pending", "paid", "failed", "refunded"]).optional(),
    transactionNo: z.string().trim().max(120).optional(),
    note: z.string().trim().max(1000).optional(),
    shippingAddress: addressSchema.omit({ id: true }).optional(),
  })
  .strict();

const contentAdminQuerySchema = paginationQuerySchema.extend({
  group: z.enum(["policy", "support", "career", "marketing"]).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

const articleAdminQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().max(120).optional(),
  status: z.enum(["draft", "published"]).optional(),
});

const makeUpdateSchema = (schema) => schema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

module.exports = {
  appointmentAdminQuerySchema,
  appointmentAdminUpdateSchema,
  articleAdminQuerySchema,
  articleCreateSchema: articlePayloadSchema,
  articleUpdateSchema: makeUpdateSchema(articlePayloadSchema),
  categoryCreateSchema: categoryPayloadSchema,
  categoryUpdateSchema: makeUpdateSchema(categoryPayloadSchema),
  contentAdminQuerySchema,
  contentPageCreateSchema: contentPagePayloadSchema,
  contentPageUpdateSchema: makeUpdateSchema(contentPagePayloadSchema.omit({ key: true })),
  doctorCreateSchema: doctorPayloadSchema,
  doctorUpdateSchema: makeUpdateSchema(doctorPayloadSchema),
  membershipOrderAdminQuerySchema,
  membershipOrderAdminUpdateSchema,
  membershipPackageCreateSchema: membershipPackagePayloadSchema,
  membershipPackageUpdateSchema: makeUpdateSchema(membershipPackagePayloadSchema),
  orderAdminQuerySchema,
  orderAdminUpdateSchema,
  productCreateSchema: productPayloadSchema,
  productUpdateSchema: makeUpdateSchema(productPayloadSchema),
};
