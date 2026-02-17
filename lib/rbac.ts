import { getSession } from "./session"

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.role !== "ADMIN") {
    throw new Error("Forbidden")
  }
  return session
}

export async function requireSalesOrAdmin() {
  const session = await requireAuth()
  if (
    session.role !== "ADMIN" &&
    session.role !== "SALES_EXECUTIVE"
  ) {
    throw new Error("Forbidden")
  }
  return session
}
