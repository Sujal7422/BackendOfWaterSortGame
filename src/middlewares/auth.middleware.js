import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asynchandler";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async(req,res,next)=>{
   try {
    const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearor", "")
 
     if(token){
         throw new apiError(401,"unauthorized request")
     }
 
     const decode = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
     const user = await User.findById(decode?._id).select("-Password -Refreshtoken")
 
     if (!user) {
 
         throw new apiError(401, "invalid access token")
     }
 
     req.user= user;
     next()
   } catch (error) {
    throw new apiError(401,error?.message || "invalid access token")
   }

})