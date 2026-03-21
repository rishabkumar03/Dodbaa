import ApiResponse from "../utils/apiResponse.js";
import { type Response, type NextFunction } from "express"

const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction   // must be present even if unused
) => {
    console.log("Error Middleware:", err.message);

    let statusCode = err.statusCode || 500
    let message = err.message || "Something went wrong"

    // Mongoose invalid ObjectId error
    if (err.name === "CastError") {
        statusCode = 400
        message = "Invalid ID format"
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409
        const field = Object.keys(err.keyValue)[0]
        message = `${field} already exists`
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401
        message = "Invalid token"
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401
        message = "Token has expired"
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || []
    })

    res.status(statusCode).json({
        success: false,
        statusCode,
        message: err.message || "Something went wrong",
        errors: err.errors || []
    })
}

export {
    errorMiddleware
}