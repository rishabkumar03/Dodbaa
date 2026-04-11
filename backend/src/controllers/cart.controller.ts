import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { CartModel } from "../models/cart.model.js";
import mongoose from "mongoose";
import { CouponModel } from "../models/coupon.model.js";
import { cartZodSchema } from "../validators/cart.schema.js";

const createCart = asyncHandler(async (req, res) => {
    const { productDetails, couponValue } = req.body;

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

    let totalPrice = 0
    let discountedPrice = 0
    totalPrice += productDetails.reduce((acc, item) => {
        return item.productPrice * item.quantity
    }, 0)

    if (couponValue) {
        const parsedValue = parseInt(couponValue);
        if (isNaN(parsedValue)) {
            throw new ApiError(400, "Invalid price")
        }

        discountedPrice = totalPrice - (totalPrice * parsedValue) / 100
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
    const { cartId } = req.params
    const { productDetails, quantity, couponValue } = req.body
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

    //--------------------------- revisite this---------------------------------------------
    if (quantity) {
        let prevTotal = existingCart.totalPrice
        let newTotal = 0
        const parsedQuantity = parseInt(quantity as string)
        const newMap = new Map(productDetails.map(obj => [obj[obj.productId], obj]))

        existingCart.productDetails.map(res => {
            if (newMap.has(res[res.productName])) {

            }
            res.quantity = parsedQuantity,
                newTotal = existingCart.productDetails.reduce((acc, item) => {
                    return acc + (item.productPrice * item.quantity)
                }, 0)
        })

        existingCart.totalPrice = newTotal === 0 ? prevTotal : newTotal
    }
    // ---------------------------------------------------------------------------------------------

    if (couponValue) {
        let prevTotal = existingCart.totalPrice
        let discountedPrice = 0;
        const parsedCoupon = parseInt(couponValue as string)

        // update new coupon value in DB
        existingCart.couponValue = parsedCoupon

        // calculate new discounted price
        discountedPrice = prevTotal - (prevTotal * parsedCoupon) / 100
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
    const result = await CartModel.find({ userId: req.user?._id }).lean()
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