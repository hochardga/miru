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

export const gameActionRequestSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("next_day"), payload: z.object({}).optional() }),
  z.object({
    type: z.literal("camp"),
    payload: z.object({
      foodChoice: z.enum(["eat_meal_bar", "skip_food"]),
    }),
  }),
  z.object({
    type: z.literal("combat_action"),
    payload: z.object({
      move: z.enum(["attack", "escape"]),
    }),
  }),
]);

export const journalRequestSchema = z.object({
  dayNumber: z.number().int().min(1),
  tileId: z.string().uuid().optional(),
  body: z.string().trim().min(1).max(1000),
});
