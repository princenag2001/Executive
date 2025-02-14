import express from "express";
import { fetchSideBarUsers, getMessages, sendMessages, fetchGroups } from "../controllers/messageController.js";
import { protectedRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/getUser", protectedRoute, fetchSideBarUsers);
router.get("/getMessages/:id/:type/:members", protectedRoute,getMessages);
router.post("/sendMessage/:id", protectedRoute, sendMessages);
router.get("/getGroups", protectedRoute, fetchGroups);

export default router;