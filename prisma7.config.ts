// Konfigurasi Prisma ORM v7.
// Catatan: Prisma v7 tidak lagi memuat file .env secara otomatis,
// karena itu `import "dotenv/config"` wajib ada di bagian atas file ini.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Di Prisma v7, `directUrl` sudah dihapus dan digantikan `url`.
    // Untuk perintah migrasi kita pakai DIRECT_URL (koneksi langsung, tanpa
    // pooler PgBouncer) bila disediakan; aplikasi tetap memakai DATABASE_URL.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
