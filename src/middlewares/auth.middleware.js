import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new apiError(401, "Unauthorized request: No token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new apiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded._id).select("-Password -refreshToken");
  if (!user) {
    throw new apiError(401, "Invalid access token: User not found");
  }

  req.user = user;
  next();
});
