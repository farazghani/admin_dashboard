"use server"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/rbac"
import { categorySchema } from "@/lib/validations/category.schema"
import { generateSlug } from "@/lib/slug"
import { revalidatePath } from "next/cache"

export async function createCategory(formData: FormData) {
  await requireAdmin()
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  })
  if (!parsed.success) {
    throw new Error("Invalid input")
  }
  const { name } = parsed.data
  const slug = generateSlug(name)
  const existing = await prisma.category.findUnique({
    where: { slug },
  })
  if (existing) {
    throw new Error("invalid input");
  }
  await prisma.category.create({
    data: { name, slug },
  })

  revalidatePath("/dashboard/categories")
}
type CategoryFormState = {
  error: string
}
export async function updateCategory(
  id: string,
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin()

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
  })

  if (!parsed.success) {
    return { error: "Invalid input" }
  }

  const { name } = parsed.data
  const slug = generateSlug(name)

  await prisma.category.update({
    where: { id },
    data: { name, slug },
  })

  revalidatePath("/dashboard/categories")

  return { error: "" }
}
export async function deleteCategory(id: string) {
  await requireAdmin()

  const linked = await prisma.productCategory.findFirst({
    where: { categoryId: id },
  })

  if (linked) {
    throw new Error("cannot delete category linked with products");
  }

  await prisma.category.delete({
    where: { id },
  })

  revalidatePath("/dashboard/categories")
}
