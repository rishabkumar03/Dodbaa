import mongoose, { Schema, Document } from "mongoose";

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: mongoose.Types.ObjectId[];   // references OrderItem
  totalAmount: number;
  orderStatus: "Order Placed" | "Order Shipped" | "Order Delivered";
}

const OrderDbSchema: Schema<OrderDocument> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItemModel",
        required: true,
      },
    ],

    totalAmount: {
      type: Number,
      min: 0,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["Order Placed", "Order Shipped", "Order Delivered", "Order Cancelled", "Order Returned"],
      default: "Order Placed",
    },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<OrderDocument>(
  "OrderModel",
  OrderDbSchema
);