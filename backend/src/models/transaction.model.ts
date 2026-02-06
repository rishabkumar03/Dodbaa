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
        trim: true
    }, 
    paymentStatus: {
        type: String,
    },
    paymentGatewayId: {
        type: String,
    },
    paymentOrderId: {
        type: Schema.Types.ObjectId,
        ref: "OrderModel"
    },
    paymentUserId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel"
    }
}, { timestamps: true })

export const TransactionModel = mongoose.model<TransactionDocument>("TransactionModel", TransactionDbSchema)