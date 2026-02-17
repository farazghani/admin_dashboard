import { z } from "zod"

export const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  brand: z.string().min(1),
  thumbnailImageUrl: z.string().min(1),
  galleryImages: z.array(z.string()).min(1),
  shortDescription: z.string().max(200),
  longDescription: z.string().min(10),
  categoryIds: z.array(z.string()).min(1),
})
