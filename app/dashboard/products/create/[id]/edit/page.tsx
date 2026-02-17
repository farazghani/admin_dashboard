import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { notFound } from "next/navigation"
import { ProductEditForm } from "@/components/dashboard/ProductEditForm"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      categories: true,
      galleryImages: true,
    },
  })

  if (!product) notFound()

  const categories = await prisma.category.findMany()

  return (
    <ProductEditForm
      product={product}
      categories={categories}
    />
  )
}
