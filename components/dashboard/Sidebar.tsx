"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname()

  const links = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Products", href: "/dashboard/products" },
    { name: "Categories", href: "/dashboard/categories" },
  ]

  if (role === "ADMIN") {
    links.push({ name: "Users", href: "/dashboard/users" })
  }

  const NavLinks = () => (
    <nav className="space-y-2 px-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "block rounded-md px-3 py-2 text-sm",
            pathname === link.href
              ? "bg-primary text-white"
              : "hover:bg-muted"
          )}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:block">
        <div className="p-6 font-bold text-lg">
          Admin Panel
        </div>
        <NavLinks />
      </aside>

      {/* Mobile Drawer */}
      <div className="md:hidden p-4 border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="w-64">
            <div className="p-6 font-bold text-lg">
              Admin Panel
            </div>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

