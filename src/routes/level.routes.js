// src/routes/level.routes.js
import { Router } from "express";
import {
  getDifficultiesProgress,
  getLevelData,
  updateDifficultyProgress
} from "../controllers/level.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// ✅ Get user progress for all difficulties
router.get("/getDifficultiesProgress", verifyJWT, getDifficultiesProgress);

// ✅ Get specific level data
router.get("/:difficulty/:levelNumber", verifyJWT, getLevelData);

// ✅ Update level progress
router.patch("/updateDifficultyProgress", verifyJWT, updateDifficultyProgress);

export default router;
