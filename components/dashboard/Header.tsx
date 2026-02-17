"use client"

import { logoutAction } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"

export default function Header({ role }: { role: string }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-4 bg-background">
      <div className="text-sm text-muted-foreground">
        Logged in as: {role}
      </div>

      <form action={logoutAction}>
        <Button variant="destructive">Logout</Button>
      </form>
    </header>
  )
}
