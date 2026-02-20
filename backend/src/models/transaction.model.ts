import mongoose, { Schema, Document } from "mongoose";

export interface TransactionDocument extends Document {
    paymentMethod: string;
    paymentStatus: string;
    paymentGatewayId: string;

    paymentOrderId: mongoose.Types.ObjectId;
    paymentUserId: mongoose.Types.ObjectId;
}

const TransactionDbSchema: Schema<TransactionDocument> = new Schema({
    paymentMethod: {
        type: String,
        enum: ["COD", "Razorpay", "Stripe"],
        required: true
    }, 
    paymentStatus: {
        type: String,
        enum: ["Pending", "Success", "Failed"],
        required: true
    },
    paymentGatewayId: {
        type: String,
    },
    paymentOrderId: {
        type: Schema.Types.ObjectId,
        ref: "OrderModel",
        required: true
    },
    paymentUserId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    }
}, { timestamps: true })

export const TransactionModel = mongoose.model<TransactionDocument>("TransactionModel", TransactionDbSchema)