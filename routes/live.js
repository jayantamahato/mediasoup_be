import { Router } from "express";
import {
  createLive,
  endLive,
  getAllLive,
  getAllLiveByAstrologer,
  getAllActiveLive,
} from "../controller/live.js";
const router = Router();
router.post("/", createLive);
router.get("/", getAllLive);
router.get("/active", getAllActiveLive);
router.get("/:id", getAllLiveByAstrologer);
router.post("/end", endLive);
export { router as liveRouter };
