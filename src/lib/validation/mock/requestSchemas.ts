import { z } from "zod";

export const createRequestBody = z.object({
  requestorName: z.string().min(3).max(30),
  itemRequested: z.string().min(2).max(100),
});

export const listRequestQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  status: z.enum(["pending", "completed", "approved", "rejected"]).optional(),
});

export const patchRequestBody = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "completed", "approved", "rejected"]),
});
