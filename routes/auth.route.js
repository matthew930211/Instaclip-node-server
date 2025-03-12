import express from "express";
import { instagramCallback, instagramLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/instagram-login", instagramLogin);
router.get("/instagram-callback", instagramCallback);
router.get("/insta-cookies", async (req, res) => {
    console.log("req.cookies : ", req.cookies);
})

export default router