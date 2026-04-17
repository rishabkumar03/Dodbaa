import mongoose from "mongoose";
import { CouponModel } from "../models/coupon.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { couponZodSchema, UpdateCouponZodSchema } from "../validators/coupon.schema.js";

const setCoupoun = asyncHandler(async (req, res) => {
    const { couponName, couponValue, couponExpiry } = req.body;
    
    if (!couponName || !couponExpiry || !couponValue) {
        throw new ApiError(400, "coupon name, value and expiry is required")
    }

    // validate date properly
    const expiryDate = new Date(couponExpiry)
    if (isNaN(expiryDate.getTime())) {
        throw new ApiError(400, "Invalid expiry date format")
    }
    if (expiryDate <= new Date()) {
        throw new ApiError(400, "Expiry date must be in the future")
    }

    // check duplicate
    const existingCoupon = await CouponModel.findOne({ couponName });

    if (existingCoupon) {
        throw new ApiError(400, `coupon with name ${couponName} already exist`)
    }

    const couponData = {
        couponName: String(couponName).toUpperCase(),
        couponValue: parseInt(couponValue),
        couponExpiry: expiryDate
    }

    // zod validation missing
    const result = couponZodSchema.safeParse(couponData)
    if (!result.success) {
        throw new ApiError(400, "Coupon validation failed", result.error.flatten().fieldErrors)
    }

    const newCoupon = await CouponModel.create(result.data)
    if (!newCoupon) {
        throw new ApiError(500, "Something went wrong while create new coupon")
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            newCoupon,
            "New coupon created successfully"
        )
    )
})

const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        throw new ApiError(400, "Invalid id params")
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Coupon ID")
    }

    const existingCoupon = await CouponModel.findById(id);
    if (!existingCoupon) {
        throw new ApiError(404, "Coupoun not found")
    }

    const deletedCoupon = await CouponModel.findByIdAndDelete(id);
    if (!deletedCoupon) {
        throw new ApiError(500, "Something went wrong while deleting the coupon")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedCoupon,
            "Coupon deleted successfully"
        )
    )
})

const updateCoupon = asyncHandler(async (req, res) => {
    const { couponName, couponValue, couponExpiry } = req.body;
    const { id } = req.params;

    if (!id || typeof id !== "string") {
        throw new ApiError(400, "Coupon ID is required")
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Coupon ID")
    }

    if (!couponName && !couponExpiry && !couponValue) {
        throw new ApiError(400, "At least one field is required to update")
    }

    const existingCoupon = await CouponModel.findById(id);
    if (!existingCoupon) {
        throw new ApiError(404, `Coupon not found with id:${id} and name:${couponName}`)
    }

    // build update object with only provided fields
    const couponData: Record<string, unknown> = {}

    if (couponName) {
        couponData.couponName = String(couponName).toUpperCase()
    }

    if (couponValue) {
        couponData.couponValue = Number(couponValue)
    }

    if (couponExpiry) {
        const expiryDate = new Date(couponExpiry)
        if (isNaN(expiryDate.getTime())) {
            throw new ApiError(400, "Invalid expiry date format")
        }
        if (expiryDate <= new Date()) {
            throw new ApiError(400, "Expiry date must be in the future")
        }
        couponData.couponExpiry = expiryDate
    }

    const result = UpdateCouponZodSchema.safeParse(couponData)
    if (!result.success) {
        throw new ApiError(400, "Coupon validation failed", result.error.flatten().fieldErrors)
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(
        id,
        { $set: result.data },
        { new: true }
    )

    if (!updatedCoupon) {
        throw new ApiError(400, "Something went wrong while updating the coupon")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedCoupon,
            "Coupon updated successfully"
        )
    )
})

const getAllCoupons = asyncHandler(async (req, res) => {
    const result = await CouponModel.find({
        isActive: true,
        couponExpiry: { $gt: new Date() }
    }).lean();

    if (result.length === 0) {
        throw new ApiError(404, "No coupon found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Fetched all coupons successfully"
        )
    )
})

const toggleCouponState = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
        throw new ApiError(400, "Invalid Id parameter")
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Id")
    }

    const existingCoupon = await CouponModel.findById(id)
    if (!existingCoupon) {
        throw new ApiError(404, "Coupon not found")
    }

    const updatedCoupon = await CouponModel.findByIdAndUpdate(id,
        { $set: { isActive: { $not: "$isActive" } } },
        { new: true }
    )
    if (!updatedCoupon) {
        throw new ApiError(500, "Something went wrong while toggling the coupon state")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedCoupon,
            "Coupon state toggled successfully"
        )
    )
})

const searchCoupon = asyncHandler(async (req, res) => {
    const { couponName } = req.query;
    if (!couponName || typeof couponName !== "string") {
        throw new ApiError(400, "Invalid parameter")
    }

    const existingCoupon = await CouponModel.findOne({ couponName })

    // check coupon expiry
    if (existingCoupon && existingCoupon?.couponExpiry > new Date()) {
        throw new ApiError(400, "Coupon Expired")
    }
    if (!existingCoupon) {
        throw new ApiError(404, "Invalid Coupoun Code:coupon not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            existingCoupon,
            "Coupoun fetched successfully"
        )
    )

})

export {
    setCoupoun,
    deleteCoupon,
    updateCoupon,
    getAllCoupons,
    toggleCouponState,
    searchCoupon
}