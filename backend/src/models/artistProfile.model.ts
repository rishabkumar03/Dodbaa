import mongoose, { Schema, Document } from "mongoose";

interface ArtistDocument extends Document {
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
    displayName: {
        type: String,
        trim: true
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
        default: true
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