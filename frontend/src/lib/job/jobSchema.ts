import { z } from "zod";

export const jobStatusSchema = z.enum(
  ["wishlist", "applied", "interview", "rejected", "offer"],
  { message: "Invalid status" }
);

const httpUrlSchema = z
  .string()
  .trim()
  .min(1, "Invalid url")
  .max(2048, "Url too long")
  .refine((s) => {
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  }, "Invalid url");

export const createJobSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title too long"),
  company: z.string().trim().min(1, "Company is required").max(200, "Company too long"),
  url: z
    .union([httpUrlSchema, z.literal("")])
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : v)),
  status: jobStatusSchema,
  relevance: z.number().int().min(1, "Relevance must be 1-5").max(5, "Relevance must be 1-5"),
  notes: z
    .string()
    .optional()
    .transform((v) => {
      if (v == null) return undefined;
      const s = v.trim();
      return s.length === 0 ? undefined : s;
    })
    .refine((v) => v == null || v.length <= 1000, "Notes too long"),
});

export const updateJobSchema = createJobSchema;

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;

