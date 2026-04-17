import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { CartModel } from "../models/cart.model.js";
import mongoose from "mongoose";
import { CouponModel } from "../models/coupon.model.js";
import { cartZodSchema } from "../validators/cart.schema.js";

const createCart = asyncHandler(async (req, res) => {
    const { productDetails, couponCode } = req.body;

    // product details validation
    if (!productDetails || !Array.isArray(productDetails)) {
        throw new ApiError(400, "Product details must be an array")
    }
    if (productDetails.length === 0) {
        throw new ApiError(400, "Product details can't be empty")
    }

    // price and quantity check inside the product details
    if (productDetails.some(res => res === undefined)) {
        throw new ApiError(400, `${res} required got an empty value`)
    }

    const totalPrice = productDetails.reduce((acc, item) => {
        return acc + (item.productPrice * item.quantity)
    }, 0)

    let discountedPrice = totalPrice
    let couponValue = 0;

    if (couponCode) {
        // validate coupon exists and is active
        const coupon = await CouponModel.findOne({
            couponName: couponCode.toUpperCase(),
            isActive: true,
            couponExpiry: { $gt: new Date() }
        })
        if (!coupon) {
            throw new ApiError(404, "Invalid or expired coupon")
        }

        couponValue = coupon.couponValue
        discountedPrice = totalPrice - (totalPrice * couponValue) / 100
    }

    const productObj = {
        userId: req.user?._id,
        productDetails,
        couponValue,
        totalPrice,
        discountedPrice
    }

    // Zod Validation
    const result = cartZodSchema.safeParse(productObj);
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const productData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const newCartItem = await CartModel.create(productData)
    if (!newCartItem) {
        throw new ApiError(500, "Something went wrong while creating the cart item")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            newCartItem,
            "Cart item created successfully"
        )
    )

})

const updateCart = asyncHandler(async (req, res) => {
    const { cartId } = req.params
    const { productDetails, quantity, couponCode } = req.body

    if (!cartId || typeof cartId !== "string") {
        throw new ApiError(400, "Invalid Id format")
    }

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new ApiError(400, "Invalid cartId Id")
    }

    if (!productDetails || !Array.isArray(productDetails)) {
        throw new ApiError(400, "Product details is required and must be an array")
    }

    if (productDetails.length === 0) {
        throw new ApiError(400, "Product Details can't be empty ")
    }

    const existingCart = await CartModel.findById(cartId)
    if (!existingCart) {
        throw new ApiError(404, `cart with ${cartId} not found`)
    }

    // update quantities for matching products
    productDetails.forEach((newItem: { productId: string, quantity: number }) => {
        const existing = existingCart.productDetails.find(
            p => p.productId.toString() === newItem.productId
        )

        if (existing) {
            existing.quantity = newItem.quantity
        }
    })

    // recalculate total price
    const newTotal = existingCart.productDetails.reduce((acc, item) => {
        return acc + (item.productPrice * item.quantity)
    }, 0)
    existingCart.totalPrice = newTotal

    // save discountedPrice to existingCart
    if (couponCode) {
        const coupon = await CouponModel.findOne({
            couponName: couponCode.toUpperCase(),
            isActive: true,
            couponExpiry: { $gt: new Date() }
        })

        if (!coupon) {
            throw new ApiError(404, "Invalid or expired coupon")
        }

        existingCart.couponValue = coupon.couponValue
        existingCart.discountedPrice = newTotal - (newTotal * coupon.couponValue) / 100
    } else {
        existingCart.discountedPrice = newTotal
    }

    // save the changes to DB
    const updatedCart = await existingCart.save()
    if (!updatedCart) {
        throw new ApiError(500, "Something went wrong while updating the cart")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedCart,
            "Cart updated successfully"
        )
    )
})

const deleteCart = asyncHandler(async (req, res) => {
    const { cartId } = req.params;

    if (!cartId || typeof cartId !== "string") {
        throw new ApiError(400, "Invalid Id format")
    }

    if (!mongoose.Types.ObjectId.isValid(cartId)) {
        throw new ApiError(400, "Invalid cartId Id")
    }

    const existingCart = await CartModel.findById(cartId)
    if (!existingCart) {
        throw new ApiError(404, "Cart not found")
    }

    const deletedCart = await CartModel.findByIdAndDelete(cartId)
    if (!deletedCart) {
        throw new ApiError(500, "Something went wrong while deleting the cart")
    }

    return res.status(200).json(
        new ApiResponse(
            200, deletedCart, "Cart deleted successfully"
        )
    )
})

const getAllCartItems = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id)
    
    const result = await CartModel.find({ userId }).lean()
    if (result.length === 0) {
        throw new ApiError(404, "Cart not found")
    }

    return res.status(200).json(
        new ApiResponse(200, result, "Fetched all user's cart successfully")
    )
})

export {
    createCart,
    updateCart,
    deleteCart,
    getAllCartItems
}