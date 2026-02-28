import { asyncHandler, ApiError, ApiResponse } from "../utils/modules.js";
import { UserModel } from "../models/user.model.js";
import { UserZodSchema } from "../validators/user.schema.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import type { Request } from "express";
import z from "zod";

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: mongoose.Types.ObjectId;
                fullname: string;
                email: string;
                role: "user"| "artist" | "admin";
            }
        }
    }
}

// declared accessTokenOptions & refreshTokenOptions globally for usage in every needed scenario
// maxAge is used for longer mortality of tokens. now the cookie won't die when browser closes. (Sufficient for users)

const accessTokenOptions = {
    httpOnly: true, // Cookies with httpOnly are safe
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 3 * 60 * 60 * 1000 // accessToken expiry duration
}

const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: 7 * 24 * 60 * 60 * 1000 // refreshToken expiry duration
}

const generateAccessAndRefreshTokens = async(userId: string) => {

    // Initially, used to authorize user 
    // renew tokens for longer duration

    try {
        const user = await UserModel.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found", [], "")
        }
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }
    } catch (error) {
        if (error instanceof ApiError) throw error
        throw new ApiError(500, "Something went wrong while generating access & refresh tokens", [], "")
    }
}

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    // validation by required property - should not be empty
    // check if user exists or not: email
    // create user object & entries in database
    // remove password & refreshToken field from response
    // validate user creation or entries
    // return response

    // This is the perfect use of validators (here user.validator.ts)
    const parsed = UserZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error?.issues[0]?.message || "Validation failed", [], "")
    }

    const { email, phone } = parsed.data

    const existedUser = await UserModel.findOne({
        $or: [{ email }, { phone }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or phone number already exists", [], "")
    }

    const filteredData = Object.fromEntries(
        Object.entries(parsed.data).filter(([_, value]) => value !== undefined)
    )

    const createdUser = await UserModel.create(filteredData)

    const { password: _, refreshToken: __, ...userResponse } = createdUser.toObject()

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while user registration", [], "")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, userResponse, "User registration successfully")
    )
    
})

const loginUser = asyncHandler(async(req, res) => {

    // req body -> data
    // email or phone
    // user validation
    // password check
    // access and refresh token
    // send cookie

    const { email, phone, password } = req.body

    if (!email && !phone) {
        throw new ApiError(400, "Email or Phone Number is required", [], "")
    }

    const user = await UserModel.findOne({
        $or: [{email}, {phone}]
    })

    if (!user) {
        throw new ApiError(401, "Invalid credentials", [], "")
    }

    const isPasswordvalid = await user.isPasswordCorrect(password)

    if (!isPasswordvalid) {
        throw new ApiError(401, "Invalid User Credentials", [], "")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())

    const loggedInUser = await UserModel.findById(user._id).select("-password -refreshToken")

    return res
    .status(200)
    .cookie("accessToken", accessToken, accessTokenOptions)
    .cookie("refreshToken", refreshToken, refreshTokenOptions)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req, res) => {

    // $unset: {refreshToken} is used to remove the field from document

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        }, 
        {
            new: true
        }
    )

    return res
    .status(200)
    .clearCookie("accessToken", accessTokenOptions)
    .clearCookie("refreshToken", refreshTokenOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    // validation for refreshToken before expiry

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request", [], "")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as jwt.JwtPayload
    
        const user = await UserModel.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token", [], "")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used", [], "")
        }
    
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id.toString())
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, accessTokenOptions)
        .cookie("refreshToken", refreshToken, refreshTokenOptions)
        .json(
            new ApiResponse(
                200, 
                { accessToken, refreshToken },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, (error as Error)?.message || "Invalid refresh token", [], "")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    // validation between old password and updated password

    const { oldPassword, newPassword } = req.body

    const user = await UserModel.findById(req.user?._id)
    
    if (!user) {
        throw new ApiError(404, "User not found", [], "")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError (400, "Invalid old password", [], "")
    }

    const PasswordChangeSchema = z.object({
        oldPassword: z.string().min(1),
        newPassword: z
            .string()
            .min(6, "Password must atleast 6 characters")
    })

    const isSamePassword = await user.isPasswordCorrect(newPassword)
    if (isSamePassword) {
        throw new ApiError(400, "New password cannot be same as old password", [], "")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {

    // current user details for UI

    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    
    // updated account infomation for UI

    const { fullname, email, phone } = req.body

    if (!fullname || !email || !phone) {
        throw new ApiError(400, "All fields are required")
    }

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const existingUser = await UserModel.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: req.user._id }
    })

    if (existingUser) {
        throw new ApiError(409, "Email or phone already in use", [], "")
    }

    const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullname,
                email,
                phone
            }
        },
        { new: true }
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))

})

/*
    getUserWishlist
    getUserOrderHistory
*/

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
}