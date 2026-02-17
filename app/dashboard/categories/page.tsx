import { prisma } from "@/lib/prisma"
import { requireSalesOrAdmin, requireAdmin } from "@/lib/rbac"
import { DataTable } from "@/components/ui/DataTable"
import { deleteCategory } from "@/actions/category.actions"
import CategoryForm from "./CategoryForm"
import EditCategoryDialog from "@/components/dashboard/EditCategoryDialog"
import { getSession } from "@/lib/session"
import { Button } from "@/components/ui/button"

export default async function CategoriesPage() {
  await requireSalesOrAdmin()

  const session = await getSession()

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  })

  const isAdmin = session?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categories</h1>

      {isAdmin && <CategoryForm />}

      <DataTable
        headers={["Name", "Slug", "Actions"]}
        rows={categories.map((c) => [
          c.name,
          c.slug,
          isAdmin ? (
            <div className="flex gap-2">
              <EditCategoryDialog id={c.id} name={c.name} />

              <form action={deleteCategory.bind(null, c.id)}>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </form>
            </div>
          ) : (
            "—"
          ),
        ])}
      />
    </div>
  )
}
