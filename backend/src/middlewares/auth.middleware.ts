import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { type NextFunction } from "express";

export const verifyJWT = asyncHandler(async (req, _, next: NextFunction) => {

    // jwt token format: Authorization: Bearer <token>
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized Request")
    }

    const secret = process.env.ACCESS_TOKEN_SECRET
    if (!secret) throw new ApiError(500, "ACCESS_TOKEN_SECRET is not configured")

    const decodedToken = jwt.verify(token, secret) as { _id: string }

    const user = await UserModel.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User Not Found")
    }

    req.user = user;
    next();
})