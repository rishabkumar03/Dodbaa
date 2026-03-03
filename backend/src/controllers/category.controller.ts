import { type Request, type Response } from "express"
import { CategoryZodSchema, UpdateCategoryZodSchema } from "../validators/category.schema.js";
import type { MulterRequest } from "../types/express.d.ts"
import { CategoryModel } from "../models/category.model.js";
import mongoose from "mongoose";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/modules.js"

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
        // cleanup successful uploads before throwing error
        await Promise.all(
            cloudinaryResponse
                .filter(res => res !== null) // it stores the uploaded images to delete
                .map(res => deleteFromCloudinary(res!.public_id))
        )
        throw new ApiError(500, "One or more image uploads failed. Please try again.")
    }

    // Step 4 — extract all URLs
    req.body.images = cloudinaryResponse.map(res => ({
        imageUrl: res!.secure_url,
        publicId: res!.public_id
    }))

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
            .filter(([_, value]) => value !== undefined)
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

    // Step 1 — validate categoryId
    const categoryId = req.params?.id

    if (!categoryId || typeof categoryId !== "string") {
        throw new ApiError(400, "Category ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(400, "Invalid Category ID")
    }

    // Step 2 — check category exists
    const getCurrentCategory = await CategoryModel.findById(categoryId)

    if (!getCurrentCategory) {
        throw new ApiError(404, "Category not found")
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
        const previousImages = getCurrentCategory.images
        if (previousImages && previousImages.length > 0) {
            await Promise.all(
                previousImages.map(img => deleteFromCloudinary(img.publicId))
            )
        }

        // Step 3d — attach new image data to body
        req.body.images = cloudinaryResponse.map(res => ({
            url: res!.secure_url,
            publicId: res!.public_id
        }))
    }

    // Step 4 — validate with Zod
    const result = UpdateCategoryZodSchema.safeParse(req.body)

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

    const { name, description, slug, level, parent, images } = result.data

    // Step 5 — filter undefined values
    const categoryData = Object.fromEntries(
        Object.entries({ name, description, slug, level, parent, images })
            .filter(([_, value]) => value !== undefined)
    )

    // Step 6 — save to DB atomically
    const updatedCategory = await CategoryModel.findByIdAndUpdate(
        categoryId,
        { $set: categoryData },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedCategory, "Category updated successfully")
    )
})

// Delete Category
const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
    const categoryId = req.params?.id;

    if (!categoryId || typeof categoryId !== "string") {
        throw new ApiError(400, "Category ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        throw new ApiError(
            403,
            "Invalid Category Id"
        );
    }

    // delete previous images
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
        throw new ApiError(404, "Category not found")
    }

    const deletedData = await CategoryModel.findByIdAndDelete(categoryId);

    if (!deletedData) {
        throw new ApiError(500, "Something went wrong while deleting category")
    }

    const previousImages = category.images;
    await Promise.all(
        previousImages.map(img => deleteFromCloudinary(img!.publicId))
    )

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