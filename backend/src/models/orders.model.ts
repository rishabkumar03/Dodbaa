import mongoose, { Schema, Document } from "mongoose";

type category =
    | "ceramics"
    | "keychains"
    | "paintings"
    | "sculptures"
    | "others"

type SubCategoryMap = {
  ceramics: "pottery" | "vases" | "plates";
  keychains: "metal" | "wooden" | "custom";
  paintings: "oil" | "watercolor" | "acrylic";
  sculptures: "stone" | "metal" | "clay";
  others: "handmade" | "custom";
};

interface OrderDocument extends Document {
    userId: mongoose.Types.ObjectId
    totalAmount: number
    orderStatus: "Order Placed" | "Order Shipped" | "Order Delivered"
    // category: 
}

const OrderDbSchema: Schema<OrderDocument> = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "UserModel"
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ["Order Placed", "Order Shipped", "Order Delivered"]
    }
}, { timestamps: true })

export const OrderModel = mongoose.model<OrderDocument>("OrderModel", OrderDbSchema);