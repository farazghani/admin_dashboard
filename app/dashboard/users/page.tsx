import { requireAdmin } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import UserCreateForm from "@/components/dashboard/UserCreateForm"
import { softDeleteUser } from "@/actions/user.actions"
import { Button } from "@/components/ui/button"

export default async function UsersPage() {
  await requireAdmin()

  const users = await prisma.user.findMany({
    where: { deletedAt: null }, // 🔥 Important for soft delete
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <UserCreateForm />

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                {user.role}
              </p>
            </div>

            {/* Soft Delete Button */}
            <form
              action={softDeleteUser.bind(null, user.id)}
            >
              <Button
                variant="destructive"
                size="sm"
              >
                Delete
              </Button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}

