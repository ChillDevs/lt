import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  timeWindow: z.object({ start: z.string().optional(), end: z.string().optional() }).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  estimatedMinutes: z.number().optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["pending", "in-progress", "completed", "skipped"]).optional(),
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  estimatedMinutes: z.number().optional(),
  version: z.number().optional()
});