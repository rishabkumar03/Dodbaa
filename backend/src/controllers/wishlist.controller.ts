import { asyncHandler, ApiError, ApiResponse } from "../utils/modules.js";
import { WishlistModel } from "../models/wishlist.model.js";
import { WishlistZodSchema } from "../validators/wishlist.schema.js";
import { ProductModel } from "../models/product.model.js";
import mongoose from "mongoose";

// -> productId from req.body (validated by Zod)
// -> userId from req.user._id (from JWT always)


// addToWishlist
// -> Check if product exists in DB
// -> Check if already in wishlist 
// -> Create wishlist entry

const addToWishlist = asyncHandler(async(req, res) => {

    // (!req.user) checks if the user logged in or not
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    // Validation first should be top priority
    const parsed = WishlistZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "")
    }

    const { productId } = parsed.data

    const existingProduct = await ProductModel.findById(productId)

    if (!existingProduct) {
        throw new ApiError(404, "Product not found", [], "")
    }

    const productInWishlist = await WishlistModel.findOne({
        userId: req.user._id,
        productId
    })

    if (productInWishlist) {
        throw new ApiError(409, "Product already in wishlist", [], "")
    }

    const wishlist = await WishlistModel.create({
        userId: req.user._id,
        productId
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, wishlist, "Product added to wishlist successfully")
    )
})

// removeFromWishlist
// -> Check if wishlist entry exists or not
// -> Delete it

const removeFromWishlist = asyncHandler(async(req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const { productId } = req.params

    if (!productId) {
        throw new ApiError(400, "Product ID is required", [], "")
    }

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid Product ID", [], "")
    }

    const productInWishlist = await WishlistModel.findOne({
        userId: req.user._id,
        productId
    })

    if (!productInWishlist) {
        throw new ApiError(409, "Product doesn't exist in wishlist", [], "")
    }

    const removedProduct = await WishlistModel.findOneAndDelete({
        userId: req.user._id,
        productId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, removedProduct, "Product removed from wishlist successfully"))
})

// getUserWishlist
// -> use $lookup to join with ProductModel for product details (name, price, image)
// -> Support pagination
// -> Only return active/available products

const getUserWishlist = asyncHandler(async(req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const {
        page = "1",
        limit = "10",
        sortBy = "desc"
    } = req.query

    if (sortBy && !["asc", "desc"].includes(sortBy as string)) {
        throw new ApiError(400, "sortBy must be 'asc' or 'desc'", [], "")
    }

    const pipeline : mongoose.PipelineStage[] = []

    // Always start pipeline with $match for current user
    pipeline.push({
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) }
    })

    pipeline.push({

        // lookup is used to get details from specific models
        $lookup: {      
            from: "productModels",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
            pipeline: [
                {
                    $project: {
                        name: 1,
                        price: 1,
                        images: 1,
                        isAvailable: 1,
                        category: 1
                    }
                }
            ]
        }
    },
    {
        $addFields: {
            product: {
                $first: "$productDetails"
            }
        }
    },
    {
        $unset: "productDetails"
    })

    const sortOrder = sortBy === "asc" ? 1 : -1

    pipeline.push({
        $sort: { createdAt: sortOrder }
    })

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const countPipeline = [...pipeline, { $count: "total" }]

    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limitNum })

    const [wishlists, countResult] = await Promise.all([
        WishlistModel.aggregate(pipeline),
        WishlistModel.aggregate(countPipeline)
    ])

    const total = countResult[0]?.total || 0
    const totalPages = Math.ceil( total / limitNum )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            wishlists,
            pagination: {
                currentPage: pageNum,
                totalPages,
                total,
                hasPrevPage: pageNum > 1,
                hasNextPage: pageNum < totalPages
            }
        },
        "Wishlists fetched successfully")
    )
})

// clearWishlist
// -> deleteMany({ userId }) : removes all entries
// -> useful for "Clear All" button on wishlist page

const clearWishlist = asyncHandler(async(req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const clearWishlistData = await WishlistModel.deleteMany({
        userId: req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, clearWishlistData, "Wishlist data cleared successfully"))

})

// isInWishlist
// -> Returns { isInWishlist: true/false } : toggle generally
// -> Used by frontend to show filled/empty heart icon

const isInWishlist = asyncHandler(async(req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const { productId } = req.params

    if (!productId) {
        throw new ApiError(400, "Product ID is required", [], "")
    }

    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Invalid Product ID", [], "")
    }

    // Checking document exists or not
    const wishlistEntry = await WishlistModel.findOne({
        userId: req.user._id,
        productId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, {

        // !! converts any value to boolean. (i.e. in true/false)
        isInWishlist: !!wishlistEntry
    }, "Wishlist status fetched"))
})

// getWishlistCount
// -> Returns like { count: 5 }
// -> Used for wishlist badge number on navbar

const getWishlistCount = asyncHandler(async(req, res) => {

    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    // countDocuments is much faster than find(). It doesn't fetch actual data
    const count = await WishlistModel.countDocuments({
        userId: req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, { count }, "Wishlist count fetched successfully"))
})

export {
    addToWishlist,
    removeFromWishlist,
    getUserWishlist,
    clearWishlist,
    isInWishlist,
    getWishlistCount
}