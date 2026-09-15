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
  weight: z.coerce.number().int().min(50).max(50000).optional(),
  sku: z.string().max(50).optional(),
  stockQty: z.coerce.number().int().min(1).max(9999).optional(),
  images: z.array(z.object({ url: z.string().url(), isDefect: z.boolean().default(false) })).min(1),
});

export const addressSchema = z.object({
  street: z.string().min(5),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().regex(/^\d{4,6}$/),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  provinceId: z.string().optional().nullable(),
  cityId: z.string().optional().nullable(),
  subdistrictId: z.string().optional().nullable(),
  phone: z.string().regex(/^\+?[0-9]{9,15}$/).optional().nullable().or(z.literal("")),
  label: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

export const checkoutSchema = z.object({
  productIds: z.array(z.string()).min(1),
  addressId: z.string().min(1),
  courier: z.string().min(1),
  shippingMethod: z.enum(["LEGACY", "RAJAONGKIR", "LALAMOVE"]).default("LEGACY"),
  courierService: z.string().optional(),
  promoCode: z.string().trim().toUpperCase().optional().or(z.literal("")),
});
