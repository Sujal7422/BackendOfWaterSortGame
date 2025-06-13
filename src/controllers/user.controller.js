import { asyncHandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponce } from "../utils/apiResponse.js";
import { Level } from "../models/level.model.js";

const genrateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const userRefreshToken = user.generateRefreshToken()
        const userAccessToken = user.generateAccessToken()

        user.userRefreshToken = userRefreshToken
        await user.save({validateBeforeSave: false})

        return { userAccessToken , userRefreshToken }

    } catch (error) {
        throw new apiError(500, "somthing went wrong while genrateAccessAndRefereshTokens")
    }
}

const registerUser = asyncHandler(async (req,res) =>{
    const {Username ,Email, Password} = req.body;
    
    if (
        [Username, Email, Password].some(
            (field) => field?.trim() === "")
    ) {
        throw new apiError(400, "all fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{Username}, {Email}]
    });

    if (existedUser) {
        throw new apiError(409, "outher have same candestiol")
    }

    const newLevel = await Level.create({}); // <-- new copy for the user
    const user = await User.create(
        {
            Username,
            Email,
            Password,
            levelhistory: [newLevel._id]
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-Password -Refreshtoken"
    )

    if (!createdUser) {
        throw new apiError(500, "somthing whant wrong registring user")
    }

    return res.status(201).json(
        new apiResponce(200, createdUser, "user register successfully")
    )

})

const loginUser = asyncHandler( async (req, res) => { 

    const { Email , Password } = req.body;

    if (!Email || !Password ) {
        throw new apiError(401,"email and Password is required");

    }

    const user = await User.findOne({Email});

    if (!user) {
         throw new apiError(402, "user not found");
    }

    const ispasswordValid = await user.isPasswordCorrect(Password)

    if (!ispasswordValid) {
        throw new apiError(401, "password is invalid")
    }

    const {userAccessToken, userRefreshToken} = await genrateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-Password -Refreshtoken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("AccessToken",userAccessToken, options)
    .cookie("RefreshToken",userRefreshToken, options)
    .json(
        new apiResponce(200,{
            user: loggedInUser,userAccessToken,userRefreshToken
        },
        "user logged in successfully"
    )
    )


})

const logoutUser = asyncHandler(async(req , res) =>{

    await User.findByIdAndUpdate(
    req.user._id,
    {
        $set:{
            Refreshtoken:undefined
        }
    },
    {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("AccessToken", options)
    .clearCookie("RefreshToken", options)
    .json(new apiResponce(200,{},"User xyz"))

})
    
export { registerUser , loginUser ,logoutUser};