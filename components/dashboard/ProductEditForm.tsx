"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema } from "@/lib/validations/product.schema"
import { updateProduct } from "@/actions/product.actions"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormImageUpload } from "@/components/uploads/form-image-upload"
import { FormImageGalleryUpload } from "@/components/uploads/form-image-gallery-upload"
import { toast } from "sonner"
import { Form } from "@/components/ui/form"
type ProductFormData = z.infer<typeof productSchema>

export function ProductEditForm({
  product,
  categories,
}: {
  product: any
  categories: { id: string; name: string }[]
}) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product.title,
      price: product.price,
      brand: product.brand,
      thumbnailImageUrl: product.thumbnailImageUrl,
      galleryImages: product.galleryImages.map(
        (img: any) => img.url
      ),
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      categoryIds: product.categories.map(
        (c: any) => c.categoryId
      ),
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    const result = await updateProduct(product.id, data)

    if (result.success) {
      toast.success("Product updated successfully")
    } else {
      toast.error(result.error || "Update failed")
    }
  }

  return (
     <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Input {...form.register("title")} />
      <Input
        type="number"
        step="0.01"
        {...form.register("price", { valueAsNumber: true })}
      />
      <Input {...form.register("brand")} />
      <Textarea {...form.register("shortDescription")} />
      <Textarea {...form.register("longDescription")} />

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

      <FormImageUpload
        name="thumbnailImageUrl"
        label="Thumbnail"
      />

      <FormImageGalleryUpload
        name="galleryImages"
        label="Gallery"
        maxFiles={5}
      />

      <Button type="submit">
        {form.formState.isSubmitting
          ? "Updating..."
          : "Update Product"}
      </Button>
    </form>
 </Form>
  )
}
