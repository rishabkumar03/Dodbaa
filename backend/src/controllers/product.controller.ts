import mongoose from "mongoose";
import { ProductModel } from "../models/product.model.js";
import { ProductZodSchema, UpdateProductZodSchema } from "../validators/product.schema.js";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
    uploadOnCloudinary,
    deleteFromCloudinary
} from "../utils/modules.js"
import type { MulterRequest } from "../types/express.js";
import { SORT_TYPE } from "../utils/constants.js";

// Add Product
const addProduct = asyncHandler(async (req: MulterRequest, res) => {
    // Step 1 — check files
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        throw new ApiError(400, "Product images are required")
    }

    // Step 2 — upload to cloudinary
    const uploadPromises = files.map(file => uploadOnCloudinary(file.path));
    const cloudinaryResponse = await Promise.all(uploadPromises);

    // Step 3 — check failed uploads
    const failedUpload = cloudinaryResponse.some(res => res === null);
    if (failedUpload) {
        await Promise.all(
            cloudinaryResponse
                .filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )
        throw new ApiError(500, "One or more image uploads failed")
    }

    req.body.images = cloudinaryResponse.map(img => ({
        imageUrl: img!.secure_url,
        publicId: img!.public_id
    }))

    // Step 5 — validate
    // front-end data => category = "14b34as45" same for subCategory & subSubCategory

    const result = ProductZodSchema.safeParse(req.body);
    if (!result.success) {
        await Promise.all(
            cloudinaryResponse.filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )

        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    // Step 6 — filter undefined and save
    const productData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const newProduct = await ProductModel.create(productData);
    if (!newProduct) {
        throw new ApiError(500, "Something went wrong while adding new product")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            newProduct,
            "New Product Added Successfully"
        )
    )
})

// Update Product
const updateProduct = asyncHandler(async (req: MulterRequest, res) => {
    const { productId } = req.params

    if (!productId || typeof (productId) !== "string") {
        throw new ApiError(403, "Invalide Parameter");
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalide Product Id")
    }

    const existingProduct = await ProductModel.findOne({ _id: productId });
    if (!existingProduct) {
        throw new ApiError(404, "No Existing product found")
    }

    let cloudinaryResponse: Awaited<ReturnType<typeof uploadOnCloudinary>>[] = []
    const files = req.files as Express.Multer.File[];

    if (files && files.length > 0) {
        // Step 1 — upload new images
        const uploadPromises = files.map(file => uploadOnCloudinary(file.path))
        cloudinaryResponse = await Promise.all(uploadPromises)

        // Step 2 — check failed uploads
        const failedUpload = cloudinaryResponse.some(res => res === null)
        if (failedUpload) {
            await Promise.all(
                cloudinaryResponse.filter(res => res !== null)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )

            throw new ApiError(500, "Something went wrong while uploading the images")
        }

        // Step 3 — attach new images to body
        req.body.images = cloudinaryResponse.map(res => ({
            imageUrl: res!.secure_url,
            publicId: res!.public_id
        }))

    }

    // Step 4 — validate BEFORE deleting old images
    const result = UpdateProductZodSchema.safeParse(req.body);
    if (!result.success) {
        await Promise.all(
            cloudinaryResponse.filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )

        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    // Step 5 — delete old images ONLY after validation passes
    if (files && files.length > 0) {
        await Promise.all(
            existingProduct.images.map(img => deleteFromCloudinary(img.publicId))
        )
    }

    const productData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const updatedProduct = await ProductModel.findByIdAndUpdate(
        productId,
        { $set: productData },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedProduct,
            "Product Updated Successfully"
        )
    )
})

// Get All Products
const getAllProducts = asyncHandler(async (req, res) => {
    const result = await ProductModel.find().lean();
    if (result.length === 0) {
        throw new ApiError(404, "No products found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Fetched all products successfully"
        )
    )
})

// Delete Products
const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.query;
    if (!productId || typeof productId !== "string") {
        throw new ApiError(400, "Product Id is required")
    }
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid Product Id")
    }

    const existingProduct = await ProductModel.findById(productId)
    if (!existingProduct) {
        throw new ApiError(404, "No product found")
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    if (!deletedProduct) {
        throw new ApiError(500, "Something went wrong while deleting product")
    }

    // delete images after DB deletion confirmed
    if (existingProduct.images.length > 0) {
        await Promise.all(
            existingProduct.images.map(img => deleteFromCloudinary(img.publicId))
        )
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedProduct,
            "Product deleted successfully"
        )
    )
})

// Search Products
const searchProducts = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        avgRating = 0,
        sortType = "ascending",
        sortBy = 1
    } = req.query;

    // base filter
    const filter: Record<string, unknown> = { isAvailable: true }

    if (name && typeof name === "string" && name.trim() !== "") {
        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        filter.name = { $regex: escapedName, $options: "i" }
    }

    if (price) {
        const parsedPrice = Number(price);
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw new ApiError(400, "Invalid price value")
        }
        filter.price = { $lte: parsedPrice }  // products AT OR BELOW this price
    }

    if (avgRating) {
        const parsedRating = Number(avgRating)
        if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
            throw new ApiError(400, "Rating must be between 0 and 5")
        }
        filter.avgRating = { $gte: parsedRating }  // products AT OR ABOVE this rating
    }

    let sortVal: 1 | -1 = 1
    if (sortType && typeof sortType === "string") {
        sortVal = sortType.toLowerCase().includes(SORT_TYPE.ASCE) ? 1 : -1
    }

    const sortField = typeof sortBy === "string" ? sortBy : "price"

    const result = await ProductModel
        .find(filter)
        .sort({ [sortField]: sortVal })
        .lean();

    if (result.length === 0) {
        throw new ApiError(404, "No result found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Product fetched successfully"
        )
    )
})

export {
    addProduct,
    updateProduct,
    getAllProducts,
    deleteProduct,
    searchProducts
}