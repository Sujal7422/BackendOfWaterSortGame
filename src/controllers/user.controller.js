// src/controllers/user.controller.js
import { asyncHandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Level } from "../models/level.model.js";
import jwt from "jsonwebtoken";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only send cookies over HTTPS in production
  sameSite: "Strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day cookie expiry (adjust if needed)
};

const generateAccessAndRefreshTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new apiError(404, "User not found while generating tokens");

  const userRefreshToken = user.generateRefreshToken();
  const userAccessToken = user.generateAccessToken();

  user.refreshToken = userRefreshToken;
  await user.save({ validateBeforeSave: false });

  return { userAccessToken, userRefreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  const { Username, Email, Password } = req.body;

  if ([Username, Email, Password].some(field => !field?.trim())) {
    throw new apiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ Username }, { Email }] });
  if (existedUser) {
    throw new apiError(409, "Username or Email already in use");
  }

  const newLevel = await Level.create({});
  const user = await User.create({ Username, Email, Password, levelhistory: [newLevel._id] });

  const { userAccessToken, userRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  const createdUser = await User.findById(user._id).select("-Password -refreshToken");

  return res.status(201)
    .cookie("AccessToken", userAccessToken, cookieOptions)
    .cookie("RefreshToken", userRefreshToken, cookieOptions)
    .json(new apiResponse(200, { user: createdUser, userAccessToken, userRefreshToken }, "User registered and logged in successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    throw new apiError(400, "Email and Password are required");
  }

  const user = await User.findOne({ Email });
  if (!user) throw new apiError(404, "User not found");

  const isPasswordValid = await user.isPasswordCorrect(Password);
  if (!isPasswordValid) throw new apiError(401, "Invalid password");

  const { userAccessToken, userRefreshToken } = await generateAccessAndRefreshTokens(user._id);
  const loggedInUser = await User.findById(user._id).select("-Password -refreshToken");

  return res.status(200)
    .cookie("AccessToken", userAccessToken, cookieOptions)
    .cookie("RefreshToken", userRefreshToken, cookieOptions)
    .json(new apiResponse(200, { user: loggedInUser, userAccessToken, userRefreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } }, { new: true });

  return res.status(200)
    .clearCookie("AccessToken", cookieOptions)
    .clearCookie("RefreshToken", cookieOptions)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.RefreshToken || req.body?.refreshToken;
  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request - No refresh token");
  }

  try {
    const decoded = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new apiError(403, "Invalid or expired refresh token");
    }

    const { userAccessToken, userRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    return res.status(200)
      .cookie("AccessToken", userAccessToken, cookieOptions)
      .cookie("RefreshToken", userRefreshToken, cookieOptions)
      .json(new apiResponse(200, { userAccessToken, userRefreshToken }, "Access token refreshed"));
  } catch (err) {
    throw new apiError(401, "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, req.user, "Current user fetched successfully"));
});

const changeUserPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) throw new apiError(404, "User not found");
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) throw new apiError(400, "Incorrect old password");

  user.Password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { Username, Email } = req.body;
  if (!Username || !Email) throw new apiError(400, "All fields are required");

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { Username, Email } },
    { new: true }
  ).select("-Password");

  return res.status(200).json(new apiResponse(200, user, "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  changeUserPassword,
  updateAccountDetails
};
