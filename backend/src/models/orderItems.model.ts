import mongoose, { Schema, Document } from "mongoose";

interface OrderItemDocument extends Document {
    orderId: mongoose.Types.ObjectId
    productId: mongoose.Types.ObjectId
    priceAtPurchase: number
    quantity: number
}

const OrderItemDbSchema: Schema<OrderItemDocument> = new Schema({
    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "OrderModel",
        required: true
    },
    productId: {
        type: mongoose.Types.ObjectId,
        ref: "ProductModel",
        required: true
    },
    priceAtPurchase: {
        type: Number,
        required: true,
        min: 1
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
}, { timestamps: true })

export const OrderItemModel = mongoose.model<OrderItemDocument>("OrderItemModel", OrderItemDbSchema)