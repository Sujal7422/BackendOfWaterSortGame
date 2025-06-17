import { Level } from "../models/level.model.js";
import { apiError } from "../utils/apiError.js";
import fs from "fs/promises";
import path from "path";

// ✅ Get all difficulty progress for the current user
const getDifficultiesProgress = async (req, res) => {
  try {
    const levelId = req.user.levelhistory?.[0];

    if (!levelId) {
      throw new apiError(404, "User level history not found");
    }

    const userLevel = await Level.findById(levelId).lean();

    if (!userLevel) {
      throw new apiError(404, "Level data not found");
    }

    // Remove _id and __v from response
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

// ✅ Get specific level data for a given difficulty/level
const getLevelData = async (req, res) => {
  try {
    const { difficulty, levelNumber } = req.params;

    if (!difficulty || isNaN(levelNumber)) {
      throw new apiError(400, "Invalid difficulty or level number");
    }

    const idx = parseInt(levelNumber, 10);

    // Get user progress from MongoDB
    const levelId = req.user.levelhistory?.[0];
    if (!levelId) {
      throw new apiError(404, "User level history not found");
    }

    const userLevel = await Level.findById(levelId).lean();
    if (!userLevel) {
      throw new apiError(404, "Level data not found for user");
    }

    const unlockedLevel = userLevel[difficulty];

    if (unlockedLevel === undefined) {
      throw new apiError(403, `Invalid difficulty '${difficulty}'`);
    }

    if (idx > unlockedLevel) {
      throw new apiError(403, `Access denied: you have only reached level ${unlockedLevel} in '${difficulty}'`);
    }

    // Load levels from JSON file
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

    const levelData = levelsArray[idx];

    return res.status(200).json({
      success: true,
      difficulty,
      levelNumber: idx,
      levelData,
    });

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to load level data",
    });
  }
};

// ✅ Update user's difficulty level progress if on current max level
const updateDifficultyProgress = async (req, res) => {
  try {
    const { difficulty, currentLevel } = req.body;

    if (!difficulty || typeof currentLevel !== "number") {
      throw new apiError(400, "Difficulty and currentLevel are required and valid");
    }

    const levelId = req.user.levelhistory?.[0];
    if (!levelId) {
      throw new apiError(404, "User level history not found");
    }

    const userLevel = await Level.findById(levelId);
    if (!userLevel) {
      throw new apiError(404, "Level record not found for the user");
    }

    if (typeof userLevel[difficulty] !== "number") {
      throw new apiError(400, `Invalid difficulty '${difficulty}'`);
    }

    // Check if the user is at current max level
    if (userLevel[difficulty] === currentLevel) {
      userLevel[difficulty] += 1;
      await userLevel.save();

      return res.status(200).json({
        success: true,
        message: `Level updated: ${difficulty} is now ${userLevel[difficulty]}`,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `No update. User's ${difficulty} level is ${userLevel[difficulty]}, not ${currentLevel}`,
      });
    }

  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error updating level progress",
    });
  }
};

export { getDifficultiesProgress, getLevelData, updateDifficultyProgress };
