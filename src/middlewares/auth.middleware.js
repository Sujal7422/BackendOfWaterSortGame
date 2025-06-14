import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearor", "")
 
     if(!token){
         throw new apiError(1010,"unauthorized request")
     }
 
     const decode = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decode?._id).select("-password -refreshToken")

 
     if (!user) {
 
         throw new apiError(1111, "invalid access token")
     }
 
     req.user= user;
     next()
   } catch (error) {
    throw new apiError(1020,error?.message || "invalid access token")
   }

})