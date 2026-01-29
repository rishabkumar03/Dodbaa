import mongoose, {Schema, Document} from "mongoose";

export interface categoryDocument extends Document {
    name: string;
    slug: string;
    level: 1 | 2 | 3;
    parent?: mongoose.Types.ObjectId;
}

const categoryDbSchema: Schema<categoryDocument> = new Schema({
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
        ref: "Category",
        default: null
    }
}, {timestamps: true})

export const categoryModel = mongoose.model<categoryDocument>("CategoryModel", categoryDbSchema)