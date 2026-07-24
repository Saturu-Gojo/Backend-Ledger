const { z } = require("zod");

const transferSchema = z.object({
  body: z.object({
    fromAccountNumber: z.string().min(1),
    toAccountNumber: z.string().min(1),
    amount: z.number().positive(),
    idempotencyKey: z.string().min(8).max(128).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const depositSchema = z.object({
  body: z.object({
    accountNumber: z.string().min(1),
    amount: z.number().positive(),
    idempotencyKey: z.string().min(8).max(128).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

const withdrawSchema = z.object({
  body: z.object({
    accountNumber: z.string().min(1),
    amount: z.number().positive(),
    idempotencyKey: z.string().min(8).max(128).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

module.exports = { transferSchema, depositSchema, withdrawSchema };
