"use client"

import { useActionState } from "react"
import { updateCategory } from "@/actions/category.actions"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function EditCategoryDialog({
  id,
  name,
}: {
  id: string
  name: string
}) {
  const [state, formAction] = useActionState(
    updateCategory.bind(null, id),
    { error: "" }
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form action={formAction} className="space-y-4">
          <Input
            name="name"
            defaultValue={name}
            placeholder="Category name"
          />

          {state?.error && (
            <p className="text-red-500 text-sm">
              {state.error}
            </p>
          )}

          <Button type="submit">Update</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
