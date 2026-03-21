import { asyncHandler, ApiError } from "../utils/modules.js";
import jwt from "jsonwebtoken"
import { UserModel } from "../models/user.model.js"
import type { Request } from "express";
import { type NextFunction } from "express";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwt.JwtPayload

    const user = await UserModel.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(401, "Invalid Access Token", [], "")
    }

    req.user = user
    next()
})

export const verifyAdmin = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized Request", [], "")
    }

    if (req.user.role !== "admin") {
        throw new ApiError(403, "Access denied. Admins only.", [], "")
    }
    next()
})

export const verifyArtist = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized Request", [], "")
    }

    if (req.user.role !== "artist") {
        throw new ApiError(403, "Access denied. Artists only.", [], "")
    }
    next()
})