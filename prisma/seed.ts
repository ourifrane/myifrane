import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config()

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  const hash = (pw: string) => bcrypt.hash(pw, 10);

  await prisma.user.upsert({
    where: { email: "admin@myifrane.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@myifrane.com",
      password: await hash("admin123"),
      role: "ADMIN",
      approved: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "worker@myifrane.com" },
    update: {},
    create: {
      name: "Worker One",
      email: "worker@myifrane.com",
      password: await hash("worker123"),
      role: "WORKER",
      approved: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@myifrane.com" },
    update: {},
    create: {
      name: "Citizen One",
      email: "user@myifrane.com",
      password: await hash("user123"),
      role: "USER",
      approved: false,
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
