import { Router } from "express";
import { getDifficultiesProgress, getLevelData } from "../controllers/level.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/difficulty").get(verifyJWT, getDifficultiesProgress);
router.route("/difficultyLevelData").get(verifyJWT, getLevelData);

export default router;
