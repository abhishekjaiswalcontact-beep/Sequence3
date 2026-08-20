import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  // Owner credentials — server-side only, never in client bundle
  OWNER_EMAIL: z.string().email().optional(),
  OWNER_PASSWORD: z.string().optional(),
  // Default admin credentials — server-side only
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error(
    "Invalid environment variables:",
    JSON.stringify(envParse.error.format(), null, 2)
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? "",
  JWT_SECRET:
    process.env.JWT_SECRET ??
    "12345678901234567890123456789012",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  NODE_ENV:
    (process.env.NODE_ENV as
      | "development"
      | "test"
      | "production") ?? "development",
  // Owner — server-only, never sent to client
  OWNER_EMAIL: process.env.OWNER_EMAIL ?? "",
  OWNER_PASSWORD: process.env.OWNER_PASSWORD ?? "",
  // Default admin — server-only
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
};