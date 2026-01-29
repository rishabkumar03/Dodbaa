import mongoose, {Schema, Document} from "mongoose";

export interface WishlistDocument extends Document {
    userId: mongoose.Types.ObjectId,
    productId: mongoose.Types.ObjectId;
}

const WishlistDbSchema: Schema<WishlistDocument> = new Schema({
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
}, {timestamps: true})

export const WishlistModel = mongoose.model<WishlistDocument>("WishlistModel", WishlistDbSchema);