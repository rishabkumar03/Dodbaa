import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
    fullname: string;
    email: string;
    password: string;
    phone: string;
    role: "user" | "artist" | "admin";
    address: mongoose.Types.ObjectId;
    resetPasswordOTP?: string;
    resetPasswordOTPExpiry?: Date;
}

const UserDbSchema: Schema<UserDocument> = new Schema({
    fullname: {
        type: String,
        required: [true, "Fullname cannot be empty"]
    },
    email: {
        type: String,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    phone: {
        type: String,
        required: [true, "Phone Number is required"]
    },
    role: {
        type: String,
        enum: ["user", "artist", "admin"],
        default: "user"
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: "AddressModel",
        required: true
    },
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,

}, { timestamps: true })

export const UserModel = mongoose.model<UserDocument>("UserModel", UserDbSchema);