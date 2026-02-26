import mongoose, { Schema, Document } from "mongoose";

export interface ProductDocument extends Document {
    name: string;
    description: string;
    images: string[];
    price: number;
    avgRating: number;
    isAvailable: boolean;

    category: mongoose.Types.ObjectId;
    subCategory: mongoose.Types.ObjectId;
    subSubCategory: mongoose.Types.ObjectId;
}

const ProductDbSchema: Schema<ProductDocument> = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "Name cannot be empty"]
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    images: {
        type: [String],
        validate: {
            validator: (v: string[]) => v.length >= 2,
            message: "Product must have at least 2 images"
        },
        required: true
    },
    price: {
        type: Number,
        required: [true, "Price is required"]
    },
    avgRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel",
        required: [true, "Category is required"]
    },
    subCategory: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel",
        required: [true, "subCategory is required"]
    },
    subSubCategory: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel",
        default: null
    }
}, { timestamps: true })

export const ProductModel = mongoose.model<ProductDocument>("ProductModel", ProductDbSchema)