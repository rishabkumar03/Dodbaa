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
    const userId = req.params.id;
    if (!userId || typeof (userId) !== "string") {
        throw new ApiError(400, "User Id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    // Add userId to addressData before creating
    req.body.userAddress = new mongoose.Types.ObjectId(userId);

    const result = AddressZodSchema.safeParse(req.body);
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    // remove undefined fields
    const addressData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )


    const newAddress = await AddressModel.create(addressData);
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
    const { userId, addressId } = req.params;

    // ensure both params exist and are valid ObjectId strings
    if (!userId || !addressId) {
        throw new ApiError(400, "UserId and addressId parameters are required");
    }

    if (typeof userId !== "string" || typeof addressId !== "string") {
        throw new ApiError(400, "Invalid parameter types");
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        throw new ApiError(400, "Either UserId or AddressId is invalid");
    }

    // convert to ObjectId instances for query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const addressObjectId = new mongoose.Types.ObjectId(addressId);

    const result = await AddressModel.findOne({ _id: addressObjectId, userAddress: userObjectId });
    if (!result) {
        throw new ApiError(404, "No Address Found");
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
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
        throw new ApiError(400, "UserId and addressId parameters are required");
    }

    if (typeof userId !== "string" || typeof addressId !== "string") {
        throw new ApiError(400, "Invalid parameter types");
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        throw new ApiError(400, "Either UserId or AddressId is invalid");
    }

    // convert to ObjectId instances for query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const addressObjectId = new mongoose.Types.ObjectId(addressId);

    req.body.userAddress = userObjectId;
    const result = UpdateAddressZodSchema.safeParse(req.body)
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    const addressData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )

    const updatedAddress = await AddressModel.findByIdAndUpdate(addressObjectId,
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
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
        throw new ApiError(400, "UserId and addressId parameters are required");
    }

    if (typeof userId !== "string" || typeof addressId !== "string") {
        throw new ApiError(400, "Invalid parameter types");
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(addressId)) {
        throw new ApiError(400, "Either UserId or AddressId is invalid");
    }

    // convert to ObjectId instances for query
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const addressObjectId = new mongoose.Types.ObjectId(addressId);

    const existingAddress = await AddressModel.findOne(
        { _id: addressObjectId, userAddress: userObjectId }
    )

    if (!existingAddress) {
        throw new ApiError(404, "Address not found")
    }

    const deletedAddress = await AddressModel.findByIdAndDelete(existingAddress?._id);
    if (!deletedAddress) {
        throw new ApiError(500, "Something went wrong while deleting the address")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedAddress,
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