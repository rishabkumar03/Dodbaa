import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken"
import type { SignOptions } from "jsonwebtoken"
import type { StringValue } from "ms";
import bcrypt from "bcrypt"

export interface UserDocument extends Document {
    fullname: string;
    email: string;
    password: string;
    phone: string;
    role: "user" | "artist" | "admin";
    resetPasswordOTP?: string;
    resetPasswordOTPExpiry?: Date;

    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const UserDbSchema: Schema<UserDocument> = new Schema({
    fullname: {
        type: String,
        trim: true,
        required: [true, "Fullname cannot be empty"]
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email is required"]
    },
    password: {
        type: String,
        trim: true,
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
    resetPasswordOTP: String,
    resetPasswordOTPExpiry: Date,

}, { timestamps: true })

UserDbSchema.pre<UserDocument>("save", async function (this: UserDocument, next: any){
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password, 6)
    next()
})

UserDbSchema.methods.isPasswordCorrect = async function (password: string){
    return await bcrypt.compare(password, this.password)
}

UserDbSchema.methods.generateAccessToken = function(){
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET as string;
    if (!accessTokenSecret) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }
    const accessTokenOptions: SignOptions = {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRY as StringValue) || "3h"
    };
    return jwt.sign(
        {
            _id: this._id,
            fullname: this.fullname,
            email: this.email 
        },
        accessTokenSecret,
        accessTokenOptions
    )
}

UserDbSchema.methods.generateRefreshToken = function(){
    const refereshTokenSecret = process.env.REFRESH_TOKEN_SECRET as string;
    if (!refereshTokenSecret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }
    const referenceTokenOptions: SignOptions = {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRY as StringValue) || "7d"
    }
    return jwt.sign(
        {
            _id: this._id,
        },
        refereshTokenSecret,
        referenceTokenOptions
    )
}

export const UserModel = mongoose.model<UserDocument>("UserModel", UserDbSchema);