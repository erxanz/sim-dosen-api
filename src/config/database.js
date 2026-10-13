// Konfigurasi koneksi database (Prisma ORM v7 + driver adapter PostgreSQL).
// Prisma v7 membutuhkan driver adapter (query compiler berbasis JS, tanpa binary engine).
import "dotenv/config";
import { PrismaClient } from "../../generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL belum diatur. Salin .env.example menjadi .env lalu isi nilainya."
    );
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  return new PrismaClient({ adapter });
}

// Singleton agar hot-reload (nodemon) tidak membuat banyak connection pool.
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

export default prisma;
