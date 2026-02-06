import mongoose, {Schema, Document} from "mongoose";

export interface CategoryDocument extends Document {
    name: string;
    slug: string;
    level: 1 | 2 | 3;
    parent?: mongoose.Types.ObjectId | null;
}

const CategoryDbSchema: Schema<CategoryDocument> = new Schema({
    name: {
        type: String,
        required: [true, "Name cannot be empty"],
        trim: true
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true
    }, 
    level: {
        type: Number,
        enum: [1, 2, 3],
        required: [true, "Level is required"]
    },
    parent: {
        type: Schema.Types.ObjectId,
        ref: "CategoryModel",
        default: null
    }
}, {timestamps: true})

export const CategoryModel = mongoose.model<CategoryDocument>("CategoryModel", CategoryDbSchema)