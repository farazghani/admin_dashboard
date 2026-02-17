import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar role={session.role} />
      <div className="flex-1 flex flex-col">
        <Header role={session.role} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
