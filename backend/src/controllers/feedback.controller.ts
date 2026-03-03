import mongoose from "mongoose";
import type { MulterRequest } from "../types/express.d.ts"
import { type Request, type Response } from "express"
import { FeedbackZodSchema } from "../validators/feedback.schema.js"
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
            throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
        }
    }

    const { rating, comment, images, isPurchaseVerified, feedbackUserId, feedbackProductId } = result.data;

    // filter undefined values
    const feedbackData = Object.fromEntries(
        Object.entries({ rating, comment, images, isPurchaseVerified, feedbackUserId, feedbackProductId })
            .filter(([_, value]) => value !== undefined)
    )

    const newFeedback = await FeedbackModel.create(feedbackData)
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

    const result = await FeedbackModel.find(query);

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

})

// Delete Feedback
const deleteFeedback = asyncHandler(async (req: Request, res: Response) => {
    const feedbackId = req.params?.id;
    if (!feedbackId || typeof (feedbackId) !== "string") {
        throw new ApiError(403, " Feedback Id is required")
    }
    if (mongoose.Types.ObjectId.isValid(feedbackId)) {
        throw new ApiError(403, "Invalid Feedback Id");
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

    if (previousFeedbackImages) {
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