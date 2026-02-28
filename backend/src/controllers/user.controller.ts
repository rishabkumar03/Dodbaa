import { asyncHandler, ApiError, ApiResponse, uploadOnCloudinary } from "../utils/modules.js";
import { UserModel } from "../models/user.model.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAcessAndRefreshTokens = async(userId: string) => {

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

    const { fullname, email, password, phone } = req.body

    if (
        [fullname, email, password, phone].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required", [], "")
    }

    const existedUser = await UserModel.findOne({
        $or: [{ email }, { phone }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or phone number already exists", [], "")
    }

    const user = await UserModel.create({
        fullname,
        email,
        password,
        phone
    })

    const createdUser = await UserModel.findById(user._id).select(
        "-password -refreshToken"
    )

    console.log("User Created", createdUser);

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while user registration", [], "")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, createdUser, "User registration successfully")
    )
    
})