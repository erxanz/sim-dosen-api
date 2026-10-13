// Entry point server REST API SIM Dosen.
import "dotenv/config";
import app from "./app.js";
import prisma from "./config/database.js";

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, () => {
  console.log(`SIM Dosen API berjalan di http://localhost:${port}/api`);
});

async function shutdown(signal) {
  console.log(`\nMenerima ${signal}, menutup server dengan rapi...`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });

  // Paksa keluar bila server tidak tertutup dalam 10 detik.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
