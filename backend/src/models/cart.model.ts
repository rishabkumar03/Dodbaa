import mongoose, { Schema, Document } from "mongoose";
interface CartDocument extends Document {
    userId: mongoose.Types.ObjectId
    productDetails: {
        productId: mongoose.Types.ObjectId
        productName: string,
        productDesc?: string,
        productPrice: number,
        quantity: number,
    }[]
    couponValue: number
    totalPrice: number,
    discountedPrice: number
}

const CartDbSchema: Schema<CartDocument> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: [true, "User Id is required"]
    },
    productDetails: {
        type: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "ProductModel",
                    required: [true, "Product Id is required"]
                },
                productName: { type: String, required: [true, "Product Name is required"] },
                productDesc: { type: String },
                productPrice: { type: Number, required: [true, "Product Prict is required"] },
                quantity: { type: Number, required: [true, "Product Quantity is required"] },
            }
        ],
        validate: {
            validator: (v: unknown[]) => v.length >= 1,
            message: "Cart must have at least one product"
        }
    },
    couponValue: {
        type: Number,
        min: 0,
        max: [100, "Coupon value cannot exceed 100"],
        default: 0
    },
    totalPrice: {
        type: Number,
        required: [true, "Total price is required"],
        min: [1, "Total price must be at least 1"],
    },
    discountedPrice: {
        type: Number,
        min: 0,
        default: 0
    },


}, { timestamps: true })

export const CartModel = mongoose.model<CartDocument>("CartModel", CartDbSchema)