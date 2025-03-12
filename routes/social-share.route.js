import express from "express";
import { instaReelPost } from "../controllers/social-share.controller.js";

const router = express.Router();

router.post("/insta-reel-post", instaReelPost);

export default router