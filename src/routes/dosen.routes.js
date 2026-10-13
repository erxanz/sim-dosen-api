import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listDosen,
  getDosen,
  createDosen,
  updateDosen,
  deleteDosen,
} from "../controllers/dosen.controller.js";

const router = Router();

// Semua role yang login di sim-mhs-api boleh membaca data dosen.
router.get("/", authenticate, authorize(), listDosen);
router.get("/:id", authenticate, authorize(), getDosen);

// Penulisan/ penghapusan data dosen hanya untuk ADMIN dan BAAK
// (mengikuti pola tulis data mahasiswa di sim-mhs-api).
const TULIS = authorize("ADMIN", "BAAK");

router.post("/", authenticate, TULIS, createDosen);
router.put("/:id", authenticate, TULIS, updateDosen);
router.delete("/:id", authenticate, TULIS, deleteDosen);

export default router;
