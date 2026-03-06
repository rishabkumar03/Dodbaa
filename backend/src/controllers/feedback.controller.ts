import mongoose from "mongoose";
import type { MulterRequest } from "../types/express.d.ts"
import { type Request, type Response } from "express"
import { FeedbackZodSchema, UpdatefeedbackZodSchema } from "../validators/feedback.schema.js"
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/modules.js"
import { FeedbackModel } from "../models/feedback.model.js";

// Create Feedback
const createFeedback = asyncHandler(async (req: MulterRequest, res: Response) => {
    const { userId, productId } = req.params
    if (!userId || !productId) {
        throw new ApiError(400, "User Id and Product Id is required to create feedback")
    }
    const isValidUserId = userId && typeof (userId) === "string" && mongoose.Types.ObjectId.isValid(userId);
    const isValidProductId = productId && typeof (productId) === "string" && mongoose.Types.ObjectId.isValid(productId);

    if (!isValidUserId || !isValidProductId) {
        throw new ApiError(400, "Either UserId or ProductId is invalid")
    }

    // attach the userId and productId to req.body
    req.body.feedbackUserId = new mongoose.Types.ObjectId(userId);
    req.body.feedbackProductId = new mongoose.Types.ObjectId(productId);

    // image handling
    const files = req.files as Express.Multer.File[]
    let cloudinaryResponse: Awaited<ReturnType<typeof uploadOnCloudinary>>[] = []
    if (files && files.length > 0) {
        const uploadPromises = files.map(file => uploadOnCloudinary(file!.path));

        cloudinaryResponse = await Promise.all(uploadPromises)

        const failedUpload = cloudinaryResponse.some(res => res === null)
        if (failedUpload) {
            await Promise.all(
                cloudinaryResponse
                    .filter(res => res !== null)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )

            throw new ApiError(500, "One or more image uploads failed. Please try again.")
        }

        req.body.images = cloudinaryResponse.map(res => ({
            imageUrl: res!.secure_url,
            publicId: res!.public_id
        }))
    }

    const result = FeedbackZodSchema.safeParse(req.body)
    if (!result.success) {
        if (cloudinaryResponse.length > 0) {
            await Promise.all(
                cloudinaryResponse
                    .filter(res => res !== null)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )
        }
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const { rating, comment, images, isPurchaseVerified, feedbackUserId, feedbackProductId } = result.data;

    // filter undefined values
    const feedbackData = Object.fromEntries(
        Object.entries({ rating, comment, images, isPurchaseVerified, feedbackUserId, feedbackProductId })
            .filter(([_, value]) => value !== undefined)
    )

    const newFeedback = await (await FeedbackModel.create(feedbackData))
        .populate("feedbackUserId", "fullname")

    if (!newFeedback) {
        throw new ApiError(500, "Something went wrong while creating new feedback")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            newFeedback,
            "Feedback created successfully"
        )
    )
})

// Get All Feedbacks
const getAllFeedbacks = asyncHandler(async (req: Request, res: Response) => {
    const { rating } = req.query
    const query: Record<string, unknown> = {}
    if (rating) {
        const parsedRating = Number(rating);
        if (isNaN(parsedRating) || ![1, 2, 3, 4, 5].includes(parsedRating)) {
            throw new ApiError(400, "Rating must be 1, 2, 3, 4 or 5");
        }
        query.rating = parsedRating;
    }

    const result = await FeedbackModel.find(query)
        .populate("feedbackUserId", "fullname email")

    if (result.length === 0) {
        throw new ApiError(404, "No feedbacks found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Fetch all feedbacks successfully"
        )
    )
})

// Update Feedbacks
const updateFeedback = asyncHandler(async (req: MulterRequest, res: Response) => {

    // Step 1 — validate feedbackId
    const { feedbackId, userId } = req.params;

    if (!feedbackId || !userId) {
        throw new ApiError(400, "UserId and Feedback ID are required");
    }

    if (typeof userId !== "string" || typeof feedbackId !== "string") {
        throw new ApiError(400, "Invalid parameter types");
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(feedbackId)) {
        throw new ApiError(400, "Either UserId or Feedback ID is invalid");
    }

    // Step 2 — check feedback exists
    const feedbackUserObjectId = new mongoose.Types.ObjectId(userId);
    const feedbackObjectId = new mongoose.Types.ObjectId(feedbackId);

    const getCurrentfeedback = await FeedbackModel.findOne({ _id: feedbackObjectId, feedbackUserId: feedbackUserObjectId })

    if (!getCurrentfeedback) {
        throw new ApiError(404, "feedback not found")
    }

    // Step 3 — handle image uploads if files provided
    let cloudinaryResponse: Awaited<ReturnType<typeof uploadOnCloudinary>>[] = []
    const files = req.files as Express.Multer.File[]

    if (files && files.length > 0) {

        // Step 3a — upload new images
        const uploadPromises = (files).map(file =>
            uploadOnCloudinary(file.path)
        )
        cloudinaryResponse = await Promise.all(uploadPromises)

        // Step 3b — check if any upload failed
        const failedUpload = cloudinaryResponse.some(res => res === null)
        if (failedUpload) {
            await Promise.all(
                cloudinaryResponse
                    .filter(res => res !== null)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )
            throw new ApiError(500, "One or more image uploads failed. Please try again.")
        }

        // Step 3c — delete previous images AFTER confirming new uploads succeeded 
        const previousImages = getCurrentfeedback.images
        if (previousImages && previousImages.length > 0) {
            await Promise.all(
                previousImages.map(img => deleteFromCloudinary(img.publicId))
            )
        }

        // Step 3d — attach new image data to body
        req.body.images = cloudinaryResponse.map(res => ({
            imageUrl: res!.secure_url,
            publicId: res!.public_id
        }))
    }

    // Step 4 — validate with Zod
    const result = UpdatefeedbackZodSchema.safeParse(req.body)

    if (!result.success) {
        // cleanup new uploads if validation fails
        if (cloudinaryResponse.length > 0) {
            await Promise.all(
                cloudinaryResponse
                    .filter(res => res !== null)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )
        }
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const { rating, comment, images, isPurchaseVerified, feedbackProductId, feedbackUserId } = result.data

    // Step 5 — filter undefined values
    const feedbackData = Object.fromEntries(
        Object.entries({ rating, comment, images, isPurchaseVerified, feedbackProductId, feedbackUserId })
            .filter(([_, value]) => value !== undefined)
    )

    // Step 6 — save to DB atomically
    const updatedfeedback = await FeedbackModel.findByIdAndUpdate(
        feedbackId,
        { $set: feedbackData },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedfeedback, "feedback updated successfully")
    )
})

// Delete Feedback
const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedbackId = req.params?.id;
    if (!feedbackId || typeof (feedbackId) !== "string") {
        throw new ApiError(403, " Feedback Id is required")
    }
    if (!mongoose.Types.ObjectId.isValid(feedbackId)) {
        throw new ApiError(404, "Invalid Feedback Id");
    }

    const previousFeedback = await FeedbackModel.findById(feedbackId)
    if (!previousFeedback) {
        throw new ApiError(404, "Previous Feedback not found")
    }
    const previousFeedbackImages = previousFeedback?.images;

    const deletedFeedback = await FeedbackModel.findByIdAndDelete(feedbackId);
    if (!deletedFeedback) {
        throw new ApiError(500, "Something went wrong while deleting Feedback")
    }

    if (previousFeedbackImages && previousFeedbackImages.length > 0) {
        await Promise.all(
            previousFeedbackImages.map(img => deleteFromCloudinary(img!.publicId))
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedFeedback,
            "Feedback deleted successfully"
        )
    )
})

export {
    createFeedback,
    getAllFeedbacks,
    updateFeedback,
    deleteFeedback
}