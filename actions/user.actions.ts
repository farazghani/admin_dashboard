"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { hashPassword } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { createUserSchema } from "@/lib/validations/user.schema"
import { getSession } from "@/lib/session"

export async function createUser(data: any) {
  await requireAdmin()

  const parsed = createUserSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: "Invalid data" }
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })

  if (existing) {
    return { success: false, error: "Email already exists" }
  }

  const hashedPassword = await hashPassword(
    parsed.data.password
  )

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
    },
  })

  revalidatePath("/dashboard/users")

  return { success: true }
}

export async function updateUser(
  id: string,
  data: any
) {
  await requireAdmin()

  await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      role: data.role,
    },
  })

  revalidatePath("/dashboard/users")

  return { success: true }
}

export async function deleteUser(id: string) {
  await requireAdmin()

  await prisma.user.delete({
    where: { id },
  })

  revalidatePath("/dashboard/users")

  return { success: true }
}

export async function softDeleteUser(id: string) {
  await requireAdmin()
  const session = await getSession()
  if (session?.userId === id) {
    throw new Error("You cannot delete yourself")
  }
  const adminCount = await prisma.user.count({
    where: {
      role: "ADMIN",
      deletedAt: null,
    },
  })
  const user = await prisma.user.findUnique({
    where: { id },
  })

  if (user?.role === "ADMIN" && adminCount <= 1) {
    throw new Error("Cannot delete the last admin")
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  revalidatePath("/dashboard/users")
}
