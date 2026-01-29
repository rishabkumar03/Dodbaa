import mongoose, { Schema, Document } from "mongoose";

interface ArtistDocument extends Document {
    userId: mongoose.Types.ObjectId
    bio: string
    portfolioURLs: string[]
    socialLinks: string[]
}

const ArtistDbSchema: Schema<ArtistDocument> = new Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'UserModel'
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