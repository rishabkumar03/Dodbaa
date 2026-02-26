import mongoose, { Schema, Document } from "mongoose";

interface AddressDocument extends Document { 
    fullAddress: string,
    city: string,
    state: string,
    pinCode: string,
    landmark?: string,
    country: string,
    addressType: "home" | "work" | "other",

    userAddress: mongoose.Types.ObjectId
}

const AddressDbSchema: Schema<AddressDocument> = new Schema({
    fullAddress: {
        type: String,
        required: [true, "FullAddress is required"]
    },
    city: {
        type: String,
        required: [true, "City is required"]
    },
    state: {
        type: String,
        required: [true, "State is required"]
    },
    pinCode: {
        type: String,
        required: [true, "PinCode is required"]
    },
    landmark: {
        type: String,
    },
    country: {
        type: String,
        required: [true, "Country is required"]
    },
    addressType: {
        type: String,
        enum: [
            "home", 
            "work", 
            "other"
        ]
    },
    userAddress: {
        type: Schema.Types.ObjectId,
        ref: "UserModel",
        required: true
    }
}, { timestamps: true })

export const AddressModel = mongoose.model<AddressDocument>("AddressModel", AddressDbSchema)