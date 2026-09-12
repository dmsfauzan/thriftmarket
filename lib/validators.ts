import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["BUYER", "SELLER"]).default("BUYER"),
  storeName: z.string().min(3).max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.coerce.number().int().positive(),
  categoryId: z.string().min(1),
  condition: z.enum(["LIKE_NEW", "GOOD", "FAIR"]),
  sizeLabel: z.string().optional(),
  sizePxL: z.string().regex(/^\d+x\d+$/i, "Format PxL: mis. 68x52").optional().or(z.literal("")),
  brand: z.string().optional(),
  gender: z.string().optional(),
  defectDescription: z.string().optional(),
  images: z.array(z.object({ url: z.string().url(), isDefect: z.boolean().default(false) })).min(1),
});

export const checkoutSchema = z.object({
  productIds: z.array(z.string()).min(1),
  addressId: z.string().min(1),
  courier: z.enum(["JNE", "JNT", "SICEPAT"]),
});
