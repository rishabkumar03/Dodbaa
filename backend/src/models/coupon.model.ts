import mongoose, { Schema, Document } from "mongoose";

interface CouponDocument extends Document {
    couponName: string,
    couponValue: number,
    couponExpiry: Date,
    isActive: Boolean
}

const CouponDbSchema: Schema<CouponDocument> = new Schema({
    couponName: {
        type: String,
        required: [true, "Coupon name is required"],
        unique: true,
        uppercase: true,
        trim: true
    },
    couponValue: {
        type: Number,
        required: [true, "Coupon value is required"],
        min: [1, "Coupon value must be at least 1"],
        max: [100, "Coupon value cannot exceed 100"]
    },
    couponExpiry: {
        type: Date,
        required: [true, "Coupon expiry is required"]
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true })

export const CouponModel = mongoose.model<CouponDocument>("CouponModel", CouponDbSchema)