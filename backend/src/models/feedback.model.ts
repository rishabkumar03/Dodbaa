import mongoose, { Schema, Document } from "mongoose";

export interface FeedbackDocument extends Document {
    rating: number;
    comment: string;

    feedbackUserId: mongoose.Types.ObjectId;
    feedbackProductId: mongoose.Types.ObjectId;
}

const FeedbackDbSchema: Schema<FeedbackDocument> = new Schema({
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        trim: true
    },
    feedbackUserId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    },
    feedbackProductId: {
        type: Schema.Types.ObjectId,
        ref: "ProductModel",
        required: true
    }
}, { timestamps: true })

FeedbackDbSchema.index(
    { feedbackUserId: 1, feedbackProductId: 1 },
    { unique: true }
)

export const FeedbackModel = mongoose.model<FeedbackDocument>("FeedbackModel", FeedbackDbSchema)