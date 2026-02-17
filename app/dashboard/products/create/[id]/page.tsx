import { prisma } from "@/lib/prisma"
import { requireSalesOrAdmin } from "@/lib/rbac"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getSession } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { deleteProduct } from "@/actions/product.actions"

export default async function ProductViewPage({
  params,
}: {
  params: { id: string }
}) {
  await requireSalesOrAdmin()

  const session = await getSession()
 const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id},
    include: {
      categories: {
        include: { category: true },
      },
      galleryImages: true,
    },
  })

  if (!product) {
    notFound()
  }

  const isAdmin = session?.role === "ADMIN"

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          {product.title}
        </h1>

        {isAdmin && (
          <div className="flex gap-3">
            <Link
              href={`/dashboard/products/${product.id}/edit`}
            >
              <Button variant="outline">
                Edit
              </Button>
            </Link>

            <form
              action={deleteProduct.bind(
                null,
                product.id
              )}
            >
              <Button variant="destructive">
                Delete
              </Button>
            </form> 
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div>
        <img
          src={product.thumbnailImageUrl}
          className="w-full max-h-96 object-cover rounded-md"
        />
      </div>

      {/* Basic Info */}
      <div className="space-y-2">
        <p className="text-lg font-semibold">
          Price: ${product.price}
        </p>

        <p>
          <span className="font-semibold">
            Brand:
          </span>{" "}
          {product.brand}
        </p>

        <div>
          <span className="font-semibold">
            Categories:
          </span>{" "}
          {product.categories
            .map((c) => c.category.name)
            .join(", ")}
        </div>
      </div>

      {/* Descriptions */}
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">
            Short Description
          </h2>
          <p>{product.shortDescription}</p>
        </div>

        <div>
          <h2 className="font-semibold">
            Long Description
          </h2>
          <div
            dangerouslySetInnerHTML={{
              __html: product.longDescription,
            }}
          />
        </div>
      </div>

      {/* Gallery */}
      {product.galleryImages.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">
            Gallery
          </h2>

          <div className="grid grid-cols-3 gap-4">
            {product.galleryImages.map((img) => (
              <img
                key={img.id}
                src={img.url}
                className="rounded-md object-cover h-40 w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
