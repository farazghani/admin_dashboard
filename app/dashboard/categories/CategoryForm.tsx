"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categorySchema } from "@/lib/validations/category.schema"
import { createCategory } from "@/actions/category.actions"

export default function CategoryForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    formData.append("name", data.name)
    await createCategory(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register("name")} placeholder="Category name" />
      {errors.name && <p>{errors.name.message}</p>}
      <button type="submit">Create</button>
    </form>
  )
}
