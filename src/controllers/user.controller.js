import { asyncHandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponce } from "../utils/apiResponse.js";
import { Level } from "../models/level.model.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const userRefreshToken = user.generateRefreshToken();
        const userAccessToken = user.generateAccessToken();

        user.refreshToken = userRefreshToken;
        await user.save({ validateBeforeSave: false });

        return { userAccessToken, userRefreshToken };
    } catch (error) {
        throw new apiError(501, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { Username, Email, Password } = req.body;

    if ([Username, Email, Password].some((field) => field?.trim() === "")) {
        throw new apiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ Username }, { Email }]
    });

    if (existedUser) {
        throw new apiError(409, "Username or Email already in use");
    }

    const newLevel = await Level.create({});
    const user = await User.create({
        Username,
        Email,
        Password,
        levelhistory: [newLevel._id]
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new apiError(502, "Something went wrong while registering user");
    }

    return res.status(201).json(
        new apiResponce(200, createdUser, "User registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        throw new apiError(402, "Email and Password are required");
    }

    const user = await User.findOne({ Email });

    if (!user) {
        throw new apiError(403, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(Password);

    if (!isPasswordValid) {
        throw new apiError(404, "Password is invalid");
    }

    const { userAccessToken, userRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    return res
        .status(200)
        .cookie("AccessToken", userAccessToken, options)
        .cookie("RefreshToken", userRefreshToken, options)
        .json(
            new apiResponce(
                200,
                {
                    user: loggedInUser,
                    userAccessToken,
                    userRefreshToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    return res
        .status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json(new apiResponce(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req,res) => {
    const incomingRefrashToken = req.cookie?.refreshToken || req.body?.refreshToken

    if (!incomingRefrashToken) {
        throw new apiError(444,"unauthorized request")
    }

    try {
        const decodedTocan = jwt.verify(
            incomingRefrashToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedTocan?._id)
    
        if (!user) {
            throw new apiError(444,"invalid refreshToken")
        }
    
        if (incomingRefrashToken !== user?.refreshToken) {
            throw new apiError(444,"refreshToken is expiede")
        }
    
        const options ={
            httpOnly:true,
            secure:true
        }
    
        const {AccessToken ,newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("AccessToken",AccessToken ,options)
        .cookie("refreshToken",newrefreshToken ,options)
        .json(
            new apiResponce(
                200,
                {AccessToken,refreshToken:newrefreshToken},
                "access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401,"invalid refresh token")
    }
});

const changeUserPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new apiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new apiError(400, "Invalid old password");
    }

    user.Password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new apiResponce(200, {}, "Password changed successfully"));
});


const getCurenuser = asyncHandler(async (req,res) => {
    return res
    .status(200)
    .json(new apiResponce(200,req.user,"surent user fetched successfully"))
});

const updateAccountDetails =asyncHandler( async (req,res) => {
    const {Username ,Email} =req.body

    if (!Username || !Email) {
        throw new apiError(400,"all field are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                Username,
                Email:Email
            }
        },
        {new: true}
    ).select("-Password")

    return res
    .status(200)
    .json(new apiResponce(200,user,"Account Details updated successfully"))

});

export { registerUser, loginUser, logoutUser , refreshAccessToken , getCurenuser , changeUserPassword , updateAccountDetails };