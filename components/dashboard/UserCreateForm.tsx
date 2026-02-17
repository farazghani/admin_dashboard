"use client"

import { useForm } from "react-hook-form"
import { createUser } from "@/actions/user.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

export default function UserCreateForm() {
  const form = useForm()

  const onSubmit = async (data: any) => {
    const result = await createUser(data)

    if (result.success) {
      toast.success("User created")
      form.reset()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-4 border p-4 rounded"
    >
      <Input
        {...form.register("name")}
        placeholder="Name"
        required
      />

      <Input
        {...form.register("email")}
        placeholder="Email"
        type="email"
        required
      />

      <Input
        {...form.register("password")}
        placeholder="Password"
        type="password"
        required
      />

      <select
        {...form.register("role")}
        className="border rounded p-2 w-full"
      >
        <option value="ADMIN">Admin</option>
        <option value="SALES_EXECUTIVE">
          Sales Executive
        </option>
      </select>

      <Button type="submit">
        Create User
      </Button>
    </form>
  )
}
