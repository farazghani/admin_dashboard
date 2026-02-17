"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validations/product.schema"
import { z } from "zod"
import { createProduct } from "@/actions/product.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormImageUpload } from "@/components/uploads/form-image-upload"
import { FormImageGalleryUpload } from "@/components/uploads/form-image-gallery-upload"
import { Form } from "@/components/ui/form"
import { toast } from "sonner"

type ProductFormData = z.infer<typeof productSchema>

export function ProductCreateForm({
  categories,
}: {
  categories: { id: string; name: string }[]
}) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: 0,
      brand: "",
      thumbnailImageUrl: "",
      galleryImages: [],
      shortDescription: "",
      longDescription: "",
      categoryIds: [],
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    const result = await createProduct(data)

    if (result.success) {
      toast.success("Product created successfully")
      form.reset()
    } else {
      toast.error(result.error || "Failed to create")
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        {/* Title */}
        <Input {...form.register("title")} placeholder="Title" />

        {/* Price */}
        <Input
          type="number"
          step="0.01"
          {...form.register("price", { valueAsNumber: true })}
          placeholder="Price"
        />

        {/* Brand */}
        <Input {...form.register("brand")} placeholder="Brand" />

        {/* Short Description */}
        <Textarea
          {...form.register("shortDescription")}
          placeholder="Short description"
        />

        {/* Long Description */}
        <Textarea
          {...form.register("longDescription")}
          placeholder="Long description"
        />

        {/* Category Multi Select */}
        <select
          multiple
          {...form.register("categoryIds")}
          className="border rounded p-2 w-full"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Thumbnail Upload */}
        <FormImageUpload
          name="thumbnailImageUrl"
          label="Thumbnail"
        />

        {/* Gallery Upload */}
        <FormImageGalleryUpload
          name="galleryImages"
          label="Gallery"
          maxFiles={5}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? "Creating..."
            : "Create Product"}
        </Button>
      </form>
    </Form>
  )
}

