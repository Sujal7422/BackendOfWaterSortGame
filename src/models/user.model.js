import mongoose,{ Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        Username: {
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim: true,
            index: true
        },

        Email: {
            type: String,
            required: true,
            unique: true,
            lowercase:true,
            trim: true,
        },

        levelhistory: [
            {
                type: Schema.Types.ObjectId,
                ref:"Level"
            }
        ],

        Password: {
            type: String,
            required: [true, 'passwprd is required']
        },

        Refreshtoken: {
            type: string
        }
        
    }
)

userSchema.pre("save", async function (next) {
    if(!this.isModified("Password")) return next();
    this.Password = await bcrypt.hash(this.Password, 4)
    next()
})

userSchema.methods.isPasswordCorrect = async function (Password) {
   return await bcrypt.compare(Password, this.Password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            Email: thia.Email,
            Username: this.Username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
            {
                _id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY
            }
    )
}

export const User = mongoose.model("User", userSchema)