import mongoose, { Types } from "mongoose";
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
    // check for files
    const files = req.files as Express.Multer.File[];
    if (!files) {
        throw new ApiError(400, "Product images are required")
    }

    const uploadPromises = files.map(file => uploadOnCloudinary(file.path));

    const cloudinaryResponse = await Promise.all(uploadPromises);

    const failedUpload = cloudinaryResponse.some(res => res === null);
    if (failedUpload) {
        await Promise.all(
            cloudinaryResponse
                .filter(res => res !== null || undefined)
                .map(res => deleteFromCloudinary(res!.public_id))
        )
    }

    req.body.images = cloudinaryResponse.map(img => ({
        imageUrl: img!.secure_url,
        publicId: img!.public_id
    }))

    // String value validation
    // front-end data => category = "14b34as45" same for subCategory & subSubCategory

    const result = ProductZodSchema.safeParse(req.body);
    if (!result.success) {
        await Promise.all(
            cloudinaryResponse.filter(res => res !== null)
                .map(res => deleteFromCloudinary(res!.public_id))
        )

        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    // check for the undefined fields
    const productData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const newProduct = await ProductModel.create(productData);
    if (!newProduct) {
        throw new ApiError(500, "Something went wrong while adding new product")
    }

    return res.status(200).json(
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
    if (files) {
        const existingProductImg = existingProduct.images;
        const uploadPromises = files.map(file => uploadOnCloudinary(file.path))
        cloudinaryResponse = await Promise.all(uploadPromises)
        const failedUpload = cloudinaryResponse.some(res => res === null)
        if (failedUpload) {
            await Promise.all(
                cloudinaryResponse.filter(res => res !== null || undefined)
                    .map(res => deleteFromCloudinary(res!.public_id))
            )

            throw new ApiError(500, "Something went wrong while uploading the images")
        }

        existingProduct.images = cloudinaryResponse.map(res => ({
            imageUrl: res!.secure_url,
            publicId: res!.public_id
        }))

        req.body.images = existingProduct.images;

        // delete old images
        await Promise.all(
            existingProductImg.map(img => deleteFromCloudinary(img.publicId))
        )
    }

    const result = UpdateProductZodSchema.safeParse(req.body);
    if (!result.success) {
        await Promise.all(
            cloudinaryResponse.filter(res => res !== null || undefined)
                .map(res => deleteFromCloudinary(res!.public_id))
        )

        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
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

    const existingProductImg = existingProduct.images;
    const deletedProduct = await ProductModel.findByIdAndDelete(productId);
    if (!deletedProduct) {
        throw new ApiError(500, "Something went wrong while deleting product")
    }

    // delete existing images
    await Promise.all(
        existingProductImg.map(img => deleteFromCloudinary(img.publicId))
    )

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
    const { name, price, avgRating = 0, sortType = "ascending", sortBy = 1 } = req.query;

    // base filter
    let filter = {
        isAvailable: true
    }

    if (name && typeof name === "string" && name.trim() !== "") {
        filter = {
            ...filter,
            $or: [
                { name: { $regex: name, $option: 'i' } }
            ]
        }
    }
    if (price) {
        filter.price = Number(price);
    }
    if (avgRating) {
        filter.avgRating = Number(avgRating);
    }

    let sortVal = null;
    if (sortType && typeof sortType === "string" && sortType.trim() !== "") {
        const normalizedSortType = sortType.toLowerCase();
        if (normalizedSortType.includes(SORT_TYPE.ASCE)) {
            sortVal = 1;
        } else {
            sortVal = -1;
        }
    }

    const result = await ProductModel.find(filter);
    if (!result) {
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