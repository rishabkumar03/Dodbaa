import { type Request, type Response } from "express"
import mongoose from "mongoose";
import { AddressZodSchema, UpdateAddressZodSchema } from "../validators/address.schema.js"
import { AddressModel } from "../models/address.model.js";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
} from "../utils/modules.js"

// Create Address
const createAddress = asyncHandler(async (req: Request, res: Response) => {
    
    // Get userId from JWT
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    // First validation of body, no userAddress in body
    const result = AddressZodSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.issues[0]?.message)
    }

    // remove undefined fields
    const addressData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    // Adding userId from JWT instead of from body or parse
    const newAddress = await AddressModel.create({
        ...addressData,
        userAddress: req.user._id
    })

    if (!newAddress) {
        throw new ApiError(500, "Something went wrong while creating new address");
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            newAddress,
            "Address Created Successfully"
        )
    )
})

// Get Address
const getUserAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const rawAddressId = req.params.addressId;
    const addressId = Array.isArray(rawAddressId) ? rawAddressId[0] : rawAddressId;

    // ensure params exist and are valid ObjectId strings
    if (!addressId || !mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid Address ID", [], "")
    }

    const result = await AddressModel.findOne({ 
        _id: addressId, 
        userAddress: req.user._id 
    });

    if (!result) {
        throw new ApiError(404, "No Address Found", [], "");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            result,
            "Address Fetched Successfully"
        )
    );
})

// Update Address
const updateAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const rawAddressId = req.params.addressId;
    const addressId = Array.isArray(rawAddressId) ? rawAddressId[0] : rawAddressId;

    if (!addressId || typeof addressId !== "string" || !mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Invalid Address ID", [], "")
    }

    const result = UpdateAddressZodSchema.safeParse(req.body)

    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.issues[0]?.message)
    }

    // Check address belongs to this user
    const existing = await AddressModel.findOne({
        _id: addressId,
        userAddress: req.user._id
    })

    if (!existing) {
        throw new ApiError(404, "Address not found", [], "")
    }

    const addressData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const updatedAddress = await AddressModel.findByIdAndUpdate(addressId,
        { $set: addressData },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(
            200,
            {updatedAddress},
            "Address Updated Successfully"
        )
    )
})

// Delete Address
const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    const rawAddressId = req.params.addressId;
    const addressId = Array.isArray(rawAddressId) ? rawAddressId[0] : rawAddressId;

    if (!addressId || !mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "AddressId is invalid", [], "");
    }

    const existing = await AddressModel.findOne({ 
        _id: addressId, 
        userAddress: req.user._id }
    )

    if (!existing) {
        throw new ApiError(404, "Address not found")
    }

    await AddressModel.findByIdAndDelete(addressId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Address deleted successfully"
        )
    )
})

export {
    createAddress,
    getUserAddress,
    updateAddress,
    deleteAddress
}