import { Router } from "express";
import { login, getProfile } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Endpoint Login (Publik)
router.post("/login", login);

// Endpoint Profil (Perlu Token)
router.get("/me", authenticate, getProfile);

export default router;
