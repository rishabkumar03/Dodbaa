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
    if (!req.file?.path) {
        throw new ApiError(403, "Image file is Required", [], "");
    }

    // Step 1 - upload file to cloudinary first
    const cloudinaryResponse = await uploadOnCloudinary(req.files[0]?.path)

    // Step 2 — attach the URL to req.body before Zod validation
    req.body.images = cloudinaryResponse?.secure_url

    // Step 3 — now Zod validates it as a string URL 
    const result = CategoryZodSchema.safeParse(req.body)

    const { name, description } = req.body;

})