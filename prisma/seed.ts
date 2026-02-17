import {prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main(){
  console.log("seeding...");
  const password = await bcrypt.hash("admin123" , 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      password: password,
      role: "ADMIN",
    },
  });

  console.log(" Created admin user:", admin.email);
  
  const salesExec = await prisma.user.upsert({
    where: { email: "sales@example.com" },
    update: {},
    create: {
      email: "sales@example.com",
      name: "Sales Executive",
      password: password,
      role: "SALES_EXECUTIVE",
    },
  });

  console.log("✅ Created sales executive user:", salesExec.email);

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
      },
    }),
    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: {
        name: "Clothing",
        slug: "clothing",
      },
    }),
    prisma.category.upsert({
      where: { slug: "home-garden" },
      update: {},
      create: {
        name: "Home & Garden",
        slug: "home-garden",
      },
    }),
  ]);

  console.log("Created categories:", categories.map((c) => c.name).join(", "));

  console.log("🎉 Seeding completed!");
  
}

main().catch((e) => {
    console.error(" Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


