"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { productSchema } from "@/lib/validations/product.schema"
import { revalidatePath } from "next/cache"
import { deleteFile, deleteMultipleFiles } from "@/lib/upload"
import { redirect } from "next/navigation"
export async function createProduct(data: any) {
  await requireAdmin()

  const parsed = productSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const product = await prisma.product.create({
    data: {
      title: parsed.data.title,
      price: parsed.data.price,
      brand: parsed.data.brand,
      thumbnailImageUrl: parsed.data.thumbnailImageUrl,
      shortDescription: parsed.data.shortDescription,
      longDescription: parsed.data.longDescription,

      categories: {
        create: parsed.data.categoryIds.map((id) => ({
          categoryId: id,
        })),
      },

      galleryImages: {
        create: parsed.data.galleryImages.map((url) => ({
          url,
        })),
      },
    },
  })

  revalidatePath("/dashboard/products")

  return { success: true }
}


export async function updateProduct(
  id: string,
  data: any
) {
  await requireAdmin()

  const parsed = productSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  try {
    // 1️⃣ Update basic fields
    await prisma.product.update({
      where: { id },
      data: {
        title: parsed.data.title,
        price: parsed.data.price,
        brand: parsed.data.brand,
        thumbnailImageUrl: parsed.data.thumbnailImageUrl,
        shortDescription: parsed.data.shortDescription,
        longDescription: parsed.data.longDescription,
      },
    })

    // 2️⃣ Reset categories (many-to-many)
    await prisma.productCategory.deleteMany({
      where: { productId: id },
    })

    await prisma.productCategory.createMany({
      data: parsed.data.categoryIds.map(
        (categoryId: string) => ({
          productId: id,
          categoryId,
        })
      ),
    })

    // 3️⃣ Reset gallery images
    await prisma.galleryImage.deleteMany({
      where: { productId: id },
    })

    await prisma.galleryImage.createMany({
      data: parsed.data.galleryImages.map(
        (url: string) => ({
          productId: id,
          url,
        })
      ),
    })

    revalidatePath("/dashboard/products")

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Update failed" }
  }
}

export async function deleteProduct(id: string) {
  await requireAdmin()

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      galleryImages: true,
    },
  })

  if (!product) {
    throw new Error("Product not found")
  }

  if (product.thumbnailImageUrl) {
    await deleteFile(product.thumbnailImageUrl)
  }

  //  Delete gallery images from storage
  if (product.galleryImages.length > 0) {
    const urls = product.galleryImages.map(
      (img) => img.url
    )
    await deleteMultipleFiles(urls)
  }

  //  Delete DB records
  await prisma.product.delete({
    where: { id },
  })

  // Revalidate products listing
  revalidatePath("/dashboard/products")
   redirect("/dashboard/products")
}