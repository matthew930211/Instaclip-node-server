import express from "express"
import { createAsset, getVideos, getRecentCreatedVideo, getVideosByFilter, getDuration, saveAsset, deleteAsset, publishAsset, searchVideo, writeCaption, trimVideo } from "../controllers/asset.conroller.js"
import { checkUserQuota } from "../middlewares/checkUserQuota.js";

const router = express.Router();

router.post("/create-asset", createAsset);
router.get("/get-videos", getVideos);
router.get("/get-recent-created-video", getRecentCreatedVideo);
router.get("/get-videos-by-filter", getVideosByFilter);
router.get("/get-duration", getDuration);
router.post("/save-asset", saveAsset);
router.post("/publish-asset", publishAsset);
router.post("/delete-asset", deleteAsset);
router.get("/search", searchVideo);
router.post("/write-caption", writeCaption);
router.post("/trim-video", trimVideo);
router.post("/check-user-quota", checkUserQuota);

export default router