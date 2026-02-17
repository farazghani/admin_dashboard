import { prisma } from "@/lib/prisma"
import { requireSalesOrAdmin } from "@/lib/rbac"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/session"


export default async function ProductsPage({
  searchParams = {},
}: {
  searchParams: {
    page?: string
    search?: string
    category?: string
  }
}) {
  await requireSalesOrAdmin()

  const page = Number(searchParams.page ?? 1)
  const pageSize = 6
  const search = searchParams.search ?? ""
  const category = searchParams.category


  const where: any = {
    title: {
      contains: search,
      mode: "insensitive",
    },
  }

  if (category) {
    where.categories = {
      some: {
        categoryId: category,
      },
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        categories: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.count({ where }),
  ])



  const totalPages = Math.ceil(total / pageSize)
  const session = await getSession()
  const isAdmin = session?.role === "ADMIN"
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link href="/dashboard/products/create">
          <Button>Create Product</Button>
        </Link>
      </div>

    <div className="grid grid-cols-3 gap-4">
  {products.map((product) => (
    <div
      key={product.id}
      className="border p-4 rounded hover:shadow-lg transition-shadow"
    >
      {/* Clickable area */}
      <Link
        href={`/dashboard/products/create/${product.id}`}
        className="block"
      >
        <img
          src={product.thumbnailImageUrl}
          className="h-32 w-full object-cover rounded"
        />
        <h2 className="font-semibold mt-2">
          {product.title}
        </h2>
        <p>${product.price}</p>
        <p className="text-sm text-muted-foreground">
          {product.categories
            .map((c) => c.category.name)
            .join(", ")}
        </p>
      </Link>

      {/* Admin Edit Button */}
      {isAdmin && (
        <div className="mt-3">
          <Link
            href={`/dashboard/products/create/${product.id}/edit`}
          >
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </Link>
        </div>
      )}
    </div>
  ))}
</div>


      <div className="flex gap-2">
        {Array.from({ length: totalPages }).map((_, i) => (
          <Link key={i} href={`?page=${i + 1}`}>
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  )
}
