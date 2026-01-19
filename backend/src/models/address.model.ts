import mongoose, { Schema, Document } from "mongoose";
import type { AddressInput } from "../validators/address.schema.js"

interface AddressDocument extends AddressInput, Document { }

const AddressDbSchema: Schema<AddressDocument> = new Schema({
    address: {
        type: String,
        required: [true, "Address is required"]
    },
    pinCode: {
        type: String,
        required: [true, "PinCode is required"]
    },
    landMark: {
        type: String,
    },
}, { timestamps: true })

export const AddressModel = mongoose.model<AddressDocument>("AddressModel", AddressDbSchema)