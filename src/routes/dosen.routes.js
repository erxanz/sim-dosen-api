import { Router } from "express";
import {
  listDosen,
  getDosen,
  createDosen,
  updateDosen,
  deleteDosen,
} from "../controllers/dosen.controller.js";

const router = Router();

router.get("/", listDosen);
router.get("/:id", getDosen);
router.post("/", createDosen);
router.put("/:id", updateDosen);
router.delete("/:id", deleteDosen);

export default router;
