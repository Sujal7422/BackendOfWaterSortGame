import { Level } from "../models/level.model.js";
import { apiError } from "../utils/apiError.js";
import fs from "fs/promises";
import path from "path";

export const getDifficultiesProgress = async (req, res) => {
  try {
    const levelId = await req.user.levelhistory?.[0];

    if (!levelId) {
      throw new apiError(404, "User level history not found");
    }

    const userLevel = await Level.findById(levelId).lean();

    if (!userLevel) {
      throw new apiError(404, "Level data not found");
    }

    // Remove _id from the response
    const { _id, __v, ...difficultyData } = userLevel;

    res.status(200).json({
      success: true,
      data: difficultyData
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error"
    });
  }
};


export const getLevelData = async (req, res) => {
  try {
    const { difficulty, levelNumber } = req.params;

    if (!difficulty || isNaN(levelNumber)) {
      throw new apiError(400, "Invalid difficulty or level number");
    }

    const idx = parseInt(levelNumber, 10);

    const filePath = path.resolve("public", `${difficulty}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);

    const levelsArray = parsed.levels;
    if (!Array.isArray(levelsArray)) {
      throw new apiError(500, "Invalid level file format");
    }

    if (idx < 0 || idx >= levelsArray.length) {
      throw new apiError(404, `Level ${idx} not found in ${difficulty}`);
    }

    const levelData = levelsArray[idx]; // e.g. { tubes: [...] }

    return res.status(200).json({
      success: true,
      difficulty,
      levelNumber: idx,
      levelData,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load level data"
    });
  }
};



export { getDifficultiesProgress , getLevelData }
