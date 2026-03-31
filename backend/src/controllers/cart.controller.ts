import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { CartModel } from "../models/cart.model.js";
import mongoose from "mongoose";
import { CouponModel } from "../models/coupon.model.js";
import { cartZodSchema } from "../validators/cart.schema.js";

const createCart = asyncHandler(async (req, res) => {
    const { productDetails, couponValue } = req.body;
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

    let totalPrice = productDetails.reduce(res => res.productPrict * res.quantity, 0)
    if (couponValue) {
        const parsedValue = parseInt(couponValue);
        if (isNaN(parsedValue)) {
            throw new ApiError(400, "Invalid price")
        }

        totalPrice -= (totalPrice * parsedValue) / 100
    }
    const productObj = {
        productDetails,
        couponValue,
        totalPrice
    }

    // Zod Validation
    const result = cartZodSchema.safeParse(productObj);
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const newCartItem = await CartModel.create(result.data)
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

})

const deleteCart = asyncHandler(async (req, res) => {

})

const getAllCartItems = asyncHandler(async (req, res) => {

})

export {
    createCart,
    updateCart,
    deleteCart,
    getAllCartItems
}