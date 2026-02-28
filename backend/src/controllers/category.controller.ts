import { type Request, type Response } from "express"
import { CategoryZodSchema } from "../validators/category.schema.js";
import multer from "multer"
import type { MulterRequest } from "../types/express.d.ts"
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/modules.js"

const addCategory = asyncHandler(async (req: MulterRequest, res: Response) => {
    // Step 1 — check files exist
    if (!req.files || req.files.length === 0) {
        throw new ApiError(403, "Image file is Required");
    }

    // Step 2 — upload all files to cloudinary in parallel
    const uploadPromises = (req.files as Express.Multer.File[]).map(file =>
        uploadOnCloudinary(file.path)
    )

    const cloudinaryResponse = await Promise.all(uploadPromises)

    // Step 3 — check if any upload failed
    const failedUpload = cloudinaryResponse.some(res => res === null)
    if (failedUpload) {
        // cleanup successful uploads before throwing
        await Promise.all(
            cloudinaryResponse
                .filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )
        throw new ApiError(500, "One or more image uploads failed. Please try again.")
    }

    // Step 4 — extract all URLs
    req.body.image = cloudinaryResponse.map(res => res!.secure_url)

    // Step 5 — validate
    const result = CategoryZodSchema.safeParse(req.body)

    const { name, description } = req.body;

})