"use server"

import { prisma } from "@/lib/prisma"
import { comparePassword, signToken } from "@/lib/auth"
import { cookies } from "next/headers"
import { loginSchema } from "@/lib/validations/login.schema"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: "Invalid input" }
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.deletedAt) return { error: "Invalid credentials" }
  console.log("USER FOUND:", user)
  
  const valid = await comparePassword(password, user.password)
  if (!valid) return { error: "Invalid credentials" }

  const token = signToken({
    userId: user.id,
    role: user.role,
  })
  const cookiestore = await cookies();
  cookiestore.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  })
   
  redirect("/dashboard");
}


export async function logoutAction(){
    const cookiestore = await cookies();
    cookiestore.set('session' , '' , {expires : new Date(0) , httpOnly: true});
    redirect('/login');
}