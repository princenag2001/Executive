import express from "express";
import { register, login, updateProfile, userProfile } from "../controllers/authController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.put("/update", protectedRoute, updateProfile);
router.get("/profile", protectedRoute, userProfile);

export default router;