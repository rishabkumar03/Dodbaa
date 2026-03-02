import { type Request, type Response } from "express"
import { CategoryZodSchema, UpdateCategoryZodSchema } from "../validators/category.schema.js";
import type { MulterRequest } from "../types/express.d.ts"
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/modules.js"
import { CategoryModel } from "../models/category.model.js";
import mongoose from "mongoose";
import { file, promise } from "zod";

// Add Category
const addCategory = asyncHandler(async (req: MulterRequest, res: Response) => {
    // Step 1 — check files exist
    if (!req.files || req.files.length === 0) {
        throw new ApiError(403, "Image file is Required");
    }

    // Step 2 — upload all files to cloudinary in parallel (No await is used to collect all the promises)
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
                .filter(res => res !== null) // it stores the uploaded images to delete
                .map(res => deleteFromCloudinary(res!.public_id))
        )
        throw new ApiError(500, "One or more image uploads failed. Please try again.")
    }

    // Step 4 — extract all URLs
    req.body.images = cloudinaryResponse.map(res => res!.secure_url)

    // Step 5 — validate
    const result = CategoryZodSchema.safeParse(req.body)

    // check result.success
    if (!result.success) {
        await Promise.all(
            cloudinaryResponse.filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )

        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const { name, description, slug, level, parent, images } = result.data;

    const categoryData = Object.fromEntries(
        Object.entries({ name, description, slug, level, parent, images })
            .filter((_, value) => value !== undefined)
    )

    // Step 6 — save to DB
    const category = await CategoryModel.create(categoryData)

    // step 7 - check DB Instance
    if (!category) {
        throw new ApiError(500, "Something went wrong while creating category")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { category },
            "Category Created Successfully"
        )
    )

})

// Get All Categories
const getAllCategories = asyncHandler(async (req: MulterRequest, res: Response) => {
    const categories = await CategoryModel.find();

    if (!categories) {
        throw new ApiError(404, "No Categories Found!!")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            categories,
            "Fetched all categories successfully"
        )
    )
})

// Update Category
const updateCategory = asyncHandler(async (req: MulterRequest, res: Response) => {
    // update images 
    let uploadPromises;
    if (req.files || req.files.length > 0) {
        uploadPromises = (req.files as Express.Multer.File[]).map(file =>
            uploadOnCloudinary(file.path)
        )

    }

    const cloudinaryResponse = await Promise.all(uploadPromises)

    const failedUpload = cloudinaryResponse?.some(res => res === null);
    if (failedUpload) {
        // cleanup successful uploads before throwing
        await Promise.all(
            cloudinaryResponse
                ?.filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )
    }

    // validate user's data
    const result = UpdateCategoryZodSchema.safeParse(req.body);
    const categoryId = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(
            403,
            "Invalid Category Id"
        )
    }
    // check result.success
    if (!result.success) {
        throw new ApiError(403, "Validation failed");
    }


    const updateData = await CategoryModel.findByIdAndUpdate(categoryId, {

    })
})

// Delete Category
// TODO: store the public_id to delete image form cloudinary
const deleteCategory = asyncHandler(async (req: MulterRequest, res: Response) => {
    const categoryId = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(
            403,
            "Invalid Category Id"
        )
    }

    const deletedData = await CategoryModel.findByIdAndDelete(categoryId);

    return res.status(200).json(
        new ApiResponse(
            200,
            { deletedData },
            "Category Deleted Successfully"
        )
    )
})

export {
    addCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
}