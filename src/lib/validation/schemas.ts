import { z } from "zod";

export const startingColumnSchema = z.enum([
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
]);

export const startRunRequestSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  startingColumn: startingColumnSchema.default("E"),
});

export const runsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(5),
});
