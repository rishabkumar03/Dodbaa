import mongoose, { Schema, Document } from "mongoose";

interface ArtistDocument extends Document {
    userId: mongoose.Types.ObjectId
    status: string
    rejectionReason?: string
    displayName: string
    specialization: string[]
    isVerified: boolean
    totalSales: number
    profileImage: string
    isActive: boolean
    bio: string
    portfolioURLs: string[]
    socialLinks: string[]
}

const ArtistDbSchema: Schema<ArtistDocument> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String,
        default: null
    },
    displayName: {
        type: String,
        trim: true, 
        unique: true
    },
    specialization: [
        {
            type: String,
            required: true
        }
    ],
    isVerified: {
        type: Boolean,
        default: false
    },
    totalSales: {
        type: Number,
        default: 0
    },
    profileImage: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    bio: {
        type: String,
        trim: true,
    },
    portfolioURLs: [
        {
            type: String,
            trim: true,
        }
    ],
    socialLinks: [
        {
            type: String,
            trim: true
        }
    ]
}, { timestamps: true })

export const ArtistModel = mongoose.model<ArtistDocument>("ArtistModel", ArtistDbSchema)