import mongoose, { Schema, Document } from "mongoose";

export interface WishlistDocument extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
}

const WishlistDbSchema: Schema<WishlistDocument> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "UserModel",
            required: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "ProductModel",
            required: true
        }
    },
    { timestamps: true }
)

// ✅ Clean and separate — easy to read
WishlistDbSchema.index({ userId: 1, productId: 1 }, { unique: true })

export const WishlistModel = mongoose.model<WishlistDocument>("WishlistModel", WishlistDbSchema)

// index these two fields together
 // the combination must be unique