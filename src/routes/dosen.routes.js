import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listDosen,
  listDosenMhs,
  syncDosen,
  getDosen,
  createDosen,
  updateDosen,
  deleteDosen,
} from "../controllers/dosen.controller.js";

const router = Router();

// Penulisan/ penghapusan data dosen hanya untuk ADMIN dan BAAK
// (mengikuti pola tulis data mahasiswa di sim-mhs-api).
const TULIS = authorize("ADMIN", "BAAK");

// 1. Integrasi Langsung dengan sim-mhs-api
// Mengambil langsung daftar dosen dari sim-mhs-api (tanpa database lokal)
router.get("/mhs", authenticate, authorize(), listDosenMhs);

// Menyinkronkan daftar dosen dari sim-mhs-api ke database lokal dosen
router.post("/sync", authenticate, TULIS, syncDosen);

// 2. Resource CRUD Dosen Standar
// Semua role yang login di sim-mhs-api boleh membaca data dosen.
router.get("/", authenticate, authorize(), listDosen);
router.get("/:id", authenticate, authorize(), getDosen);

router.post("/", authenticate, TULIS, createDosen);
router.put("/:id", authenticate, TULIS, updateDosen);
router.delete("/:id", authenticate, TULIS, deleteDosen);

export default router;
