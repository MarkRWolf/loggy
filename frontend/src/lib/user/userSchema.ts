// src/lib/user/userSchema.ts
import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .refine((p) => /[0-9]/.test(p), "Must include a digit")
    .refine((p) => /[A-Z]/.test(p), "Must include an uppercase")
    .refine((p) => /[a-z]/.test(p), "Must include a lowercase"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().trim().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

