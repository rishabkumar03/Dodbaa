import mongoose, { Schema, Document } from "mongoose";
interface CartDocument extends Document {
    productDetails: {
        productId: mongoose.Types.ObjectId
        productName: string,
        productDesc: string,
        productPrict: number,
        quantity: number,
    }[]
    couponValue: number
    totalPrice: number
}

const CartDbSchema: Schema<CartDocument> = new Schema({
    productDetails: [
        {
            productId: { type: mongoose.Types.ObjectId, ref: "ProductModel", required: [true, "Product Id is required"] },
            productName: { type: String, required: [true, "Product Name is required"] },
            productDesc: { type: String },
            productPrict: { type: Number, required: [true, "Product Prict is required"] },
            quantity: { type: Number, required: [true, "Product Quantity is required"] }
        }
    ],
    // required: [true, "Product reference is required"]
    couponValue: {
        type: Number,
        min: [1, "Coupon value must be at least 1"],
        max: [100, "Coupon value cannot exceed 100"]
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [1, "Total price must be at least 1"],
    },


}, { timestamps: true })

export const CartModel = mongoose.model<CartDocument>("CartModel", CartDbSchema)