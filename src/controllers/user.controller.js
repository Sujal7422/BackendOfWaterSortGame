import { asyncHandler } from "../utils/asynchandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponce } from "../utils/apiResponse.js";
import { Level } from "../models/level.model.js";


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

    

export { registerUser };