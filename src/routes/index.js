import { Router } from "express";
import prisma from "../config/database.js";
import { ok } from "../utils/json.js";
import dosenRoutes from "./dosen.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();

// GET /api/health — cek koneksi database secara nyata.
router.get("/health", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok(res, {
      message: "Service aktif",
      data: { status: "ok", database: "terhubung" },
    });
  } catch (err) {
    return next(err);
  }
});

router.use("/auth", authRoutes);
router.use("/dosen", dosenRoutes);

export default router;

