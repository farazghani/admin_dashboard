import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function HomePage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/40">
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-6">
        <h1 className="text-4xl font-bold">
          Admin Dashboard
        </h1>

        <p className="text-muted-foreground max-w-md">
          Internal management system for products, categories, and users.
        </p>

        <Link href="/login">
          <Button size="lg">
            Go to Login
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Built by <span className="font-medium">Faraz Ghani</span>
      </footer>

    </div>
  )
}
