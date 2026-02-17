import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { ProductCreateForm } from "@/components/dashboard/ProductCreateForm"

export default async function CreateProductPage() {
  await requireAdmin()

  const categories = await prisma.category.findMany()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Create Product
      </h1>

      <ProductCreateForm categories={categories} />
    </div>
  )
}
