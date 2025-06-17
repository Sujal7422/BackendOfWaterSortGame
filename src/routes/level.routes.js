import { Router } from "express";
import { getDifficultiesProgress, getLevelData , updateDifficultyProgress} from "../controllers/level.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/getDifficultiesProgress").get(verifyJWT, getDifficultiesProgress);
router.route("/getDifficultiesProgress").get(verifyJWT, getLevelData);
router.route("/updateDifficultyProgress").get(verifyJWT, updateDifficultyProgress);

export default router;
updateDifficultyProgress