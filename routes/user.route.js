import express from "express";
import { getUserStats } from "../controllers/user.controller.js";
// import { isAdmin } from "../middlewares/isAdmin.js";

const router = express.Router();

// router.post("/check-admin-status", checkAdminStatus);
// router.get("/get-all", getAll);
// router.post("/ban-user", isAdmin, banUser); // admin access
// router.post("/unban-user", isAdmin, unbanUser); // admin access
// router.get("/get-user", isAdmin, getUser); // admin access
router.get("/get-user-stats", getUserStats);
export default router;