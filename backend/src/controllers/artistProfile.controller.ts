import { asyncHandler, ApiError, ApiResponse, uploadOnCloudinary, deleteFromCloudinary } from "../utils/modules.js";
import { ArtistModel } from "../models/artistProfile.model.js";
import { UserModel } from "../models/user.model.js";
import { ArtistApplicationZodSchema, UpdateArtistProfileSchema, RejectionArtistZodSchema } from "../validators/artistProfile.schema.js";
import { artistApprovedEmail } from "../emails/artistApproved.email.js";
import { artistRejectedEmail } from "../emails/artistRejected.email.js";
import { resend } from "../config/resend.js"
import mongoose from "mongoose";

// applyForArtist (any user)
// -> any user with role "user" can apply
// -> creates an artist profile with status: "pending"
// -> admin will review this later
// -> user cannot apply twice (check existing application)

const applyForArtist = asyncHandler(async(req, res) => {

    // (!req.user) checks if the user logged in or not.
    if (!req.user) {
        throw new ApiError(401, "Unauthorized", [], "")
    }

    // It checks if the role is user or not (should not be artist/admin)
    if (req.user.role !== "user") {
        throw new ApiError(403, "Only users can apply to become an artist", [], "")
    }

    // they already applied or not (reducing case of duplicate application)
    // checking duplicate application by userId
    const existingApplication = await ArtistModel.findOne({
        userId: req.user._id
    })

    if (existingApplication) {
        throw new ApiError(409, "You have already submitted an application", [], "")
    }

    const parsed = ArtistApplicationZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed", [], "")
    }

    // Always use findOne(). Never user find() because it always returns a truthy array
    const existingDisplayName = await ArtistModel.findOne({
        displayName: parsed.data.displayName
    })

    if (existingDisplayName) {
        throw new ApiError(409, "Artist with same display name already exists", [], "")
    }

    const filteredData = Object.fromEntries(
        Object.entries(parsed.data).filter(([_, value]) => value !== undefined)
    )

    // always attach userId from JWT
    const artist = await ArtistModel.create({ 
        ...filteredData,
        userId: req.user._id,
        status: "pending"
    })

    const { ...artistResponse } = artist.toObject()

    return res
    .status(201)
    .json(
        new ApiResponse(201, artistResponse, "Applied for Artist successfully")
    )
})

// approveArtist (admin only)
// -> sets artistProfile status: "pending" >> approved
// -> changes user role: "user" >> "artist" in UserModel
// -> sends email notification to user

const approveArtist = asyncHandler(async(req, res) => {

    // Admin sends the artistId in req.params
    const { artistId } = req.params

    if(!artistId) {
        throw new ApiError(400, "Artist ID is required", [], "")
    }

    // Finding the pending application
    const application = await ArtistModel.findById(artistId)

    if (!application) {
        throw new ApiError(404, "Application not found", [], "")
    }

    if (application.status === "approved") {
        throw new ApiError(409, "Artist is already approved", [], "")
    }

    // Updating the existing pending application
    const approvedArtist = await ArtistModel.findByIdAndUpdate(
        artistId,
        { status: "approved", isActive: true },
        { new: true}
    )

    // Updating the existing user's role
    const userToArtist = await UserModel.findByIdAndUpdate(
        application.userId,
        { role: "artist" },
        { new: true }
    )

    if (!userToArtist) {
        throw new ApiError(404, "User not found", [], "")
    }

    // Sending the approved email notification
    await resend.emails.send({
        from: process.env.SMTP_FROM as string,
        to: userToArtist.email,
        subject: "You're now a Dodbaa Artist!",
        html: artistApprovedEmail(userToArtist.fullname)
    })

    return res
    .status(200)
    .json(new ApiResponse(200, approvedArtist, "Artist approved successfully"))
})

// rejectArtist (admin only)
// -> sets status: "pending" >> rejected
// -> stores rejection reason
// -> sends email to user explaining why

const rejectArtist = asyncHandler(async(req, res) => {

    const { artistId } = req.params;

    if (!artistId) {
        throw new ApiError(400, "Artist ID is required", [], "")
    }

    const parsed = RejectionArtistZodSchema.safeParse(req.body)

    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed")
    }

    const application = await ArtistModel.findById(artistId)

    if (!application) {
        throw new ApiError(404, "Application not found", [], "")
    }

    if (application.status === "rejected") {
        throw new ApiError(409, "Application is already rejected", [], "")
    }

    // updating existing application status to rejected with reason
    const rejectedArtist = await ArtistModel.findByIdAndUpdate(
        artistId,
        {
            status: "rejected",
            rejectionReason: parsed.data.rejectionReason
        }, 
        { new: true }
    )

    // Get user details for email
    const user = await UserModel.findById(application.userId)

    if (!user) {
        throw new ApiError(404, "User not found", [], "")
    }

    // Send email notification for rejection
    await resend.emails.send({
        from: process.env.SMTP_FROM as string,
        to: user.email,
        subject: "Thankyou for applying to become Dodbaa Artist!",
        html: artistRejectedEmail(user.fullname, parsed.data.rejectionReason)
    })

    return res
    .status(200)
    .json(new ApiResponse(200, rejectedArtist, "Artist application rejected"))
})

// verifyArtist (admin only)
// -> sets isVerified : true

const verifyArtist = asyncHandler(async (req, res) => {

    const { artistId } = req.params;

    if (!artistId) {
        throw new ApiError(400, "Artist Id is required", [], "")
    }

    const artist = await ArtistModel.findById(artistId)

    if (!artist) {
        throw new ApiError(404, "Artist not found", [], "")
    }

    if (artist.isVerified) {
        throw new ApiError(409, "Artist is already verified", [], "")
    }

    if (artist.totalSales < 100) {
        throw new ApiError(409, "Artist needs at least 100 sales to be verified", [], "")
    }

    const verifiedArtist = await ArtistModel.findByIdAndUpdate(
        artistId,
        {
            isVerified: true
        }, 
        { new: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, verifiedArtist, "Artist verified successfully"))

})

// getAllApplications (admin only)
// -> returns all artist applications 
// -> filter by status: "pending" | "approved" | "rejected"
// -> pagination

const getAllApplications = asyncHandler(async (req, res) => {
    
    const { 
        page = 1, 
        limit = 10, 
        sortBy = "desc", 
        status              // status involves pending, approved or rejected 
    } = req.query

    if (sortBy && !["asc", "desc"].includes(sortBy as string)) {
        throw new ApiError(400, "sortBy must be 'asc' or 'desc'", [], "")
    }

    if (status && !["pending", "approved", "rejected"].includes(status as string)) {
        throw new ApiError(400, "status must be 'pending', 'approved' or 'rejected'", [], "")
    }

    const pipeline : mongoose.PipelineStage[] = []

    // Filtered by status is also an option
    if (status) {
        pipeline.push({
            $match: { status }
        })
    }

    pipeline.push({
        $lookup: {
            from: "usermodels",     // MongoDB collection name
            foreignField: "_id",    // field in ArtistModel
            as: "userDetails",      // field in UserModel
            pipeline: [
                {
                    $project: {
                        fullname: 1,
                        email: 1,
                        phone: 1
                    }
                }
            ]
        }, 
    },
    {
        $addFields: {
            owner: {
                $first: "$userDetails"   
            }
        }
    },
    {
        $unset: "userDetails"
    })

    // Always remember, triple equals is used for comparison
    const sortOrder = sortBy === "asc" ? 1 : -1

    pipeline.push({
        $sort: { createdAt: sortOrder }
    })

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const countPipeline = [...pipeline, { $count: "total" }]

    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limitNum })

    const [applications, countResult] = await Promise.all([
        ArtistModel.aggregate(pipeline),
        ArtistModel.aggregate(countPipeline)
    ])

    const total = countResult[0]?.total || 0
    const totalPages = Math.ceil( total / limitNum )

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                applications,
                pagination: {
                    currentPage: pageNum,
                    totalPages,
                    total,
                    hasPrevPage: pageNum > 1,
                    hasNextPage: pageNum < totalPages
                }
            },
            "Applications fetched successfully")
        )
})

// updateArtistProfile (artist only)
// -> only update fields that are sent (partial update)
// -> if new profileImage sent -> delete old from Cloudinary, upload new
// -> can update: displayName, bio, specialization, portfolioURLs, socialLinks
// -> cannot update: isVerified, totalSales, isActive (these are admin/system controlled)

const updateArtistProfile = asyncHandler(async (req, res) => {

    const { artistId } = req.params;

    if (!artistId) {
        throw new ApiError(400, "Artist ID is required", [], "")
    }

    const existingProfile = await ArtistModel.findById(artistId)

    if (!existingProfile) {
        throw new ApiError(404, "Profile not found", [], "")
    }

    const parsed = UpdateArtistProfileSchema.safeParse(req.body)
 
    if (!parsed.success) {
        throw new ApiError(400, parsed.error.issues[0]?.message || "Validation failed")
    }

    let newImageUrl: string | undefined

    if (req.file) {

        // Uploading new image to Cloudinary
        const uploaded = await uploadOnCloudinary(req.file.path)

        if (!uploaded) {
            throw new ApiError(500, "Image upload failed", [], "")
        }

        // Delete old image from Cloudinary
        if (existingProfile.profileImage) {
            await deleteFromCloudinary(existingProfile.profileImage)
        }

        newImageUrl = uploaded.secure_url
    }

    // Building update object with only provided fields
    const updateData = {
        ...parsed.data,
        ...(newImageUrl && {
            profileImage: newImageUrl
        })
    }

    const updatedProfile = await ArtistModel.findByIdAndUpdate(
        artistId,
        { $set: updateData },
        { new: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedProfile, "Artist profile updated successfully"))
})

// getArtistProfile (any user)
// -> accept artistId from req.params
// -> only return public fields (no sensetive info)
// -> populate with artist's products (will do later)

const getArtistProfile = asyncHandler(async (req, res) => {

    const { artistId } = req.params;

    if (!artistId) {
        throw new ApiError(400, "Artist ID is required", [], "")
    }

    const artistProfile = await ArtistModel.findById(artistId)
        .select("displayName bio specialization portfolioURLS socialLinks isVerified profileImage")

    if (!artistProfile) {
        throw new ApiError(404, "Artist not found", [], "")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, artistProfile, "Artist profile fetched successfully"))
})

// getAllArtists (any user)
// -> return only isActive: true artists
// -> support pagination (page, limit)
// -> support filter by specialization
// -> only return public fields

const getAllArtists = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, sortBy = "desc", speicalization } = req.query

    const pipeline: mongoose.PipelineStage[] = []

    // Only showing active and approved artists
    pipeline.push({
        $match: {
            isActive: true,
            status: "approved",
            ...(speicalization && { specialization: { $in: [speicalization] } })
        }
    })

    // Only returning public fields
    // (1 = include) (0 = exclude)
    pipeline.push({
        $project: {
            displayName: 1,
            bio: 1,
            speicalization: 1,
            profileImage: 1,
            isVerified: 1,
            totalSales: 1,
            portfolioURLs: 1,
            socialLinks: 1
        }
    })

    const sortOrder = sortBy === "asc" ? 1 : -1
    pipeline.push({ $sort: { createdAt: sortOrder } })

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const countPipeline = [...pipeline, { $count: "total" }]
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limitNum })

    
    const [artists, countResult] = await Promise.all([
        ArtistModel.aggregate(pipeline),
        ArtistModel.aggregate(countPipeline)
    ])

    const total = countResult[0]?.total || 0
    const totalPages = Math.ceil( total / limitNum )

    return res
    .status(200)
    .json(
        new ApiResponse(200, {
            artists,
            pagination: {
                currentPage: pageNum,
                totalPages,
                total,
                hasPrevPage: pageNum > 1,
                hasNextPage: pageNum < totalPages
            }
        },
        artists.length === 0 ? "No artists found" : "Artists fetched successfully")
    )
})

// deactivateArtist (admin only)
// -> don't actually delete from DB (sales history will be removed)
// -> just set isActive: false
// -> this hides them from public listings

const deactivateArtist = asyncHandler(async (req, res) => {

    const { artistId } = req.params;

    if (!artistId) {
        throw new ApiError(400, "Artist ID is required", [], "")
    }

    const artist = await ArtistModel.findById(artistId)

    if (!artist) {
        throw new ApiError(404, "Artist not found", [], "")
    }

    if (!artist.isActive) {
        throw new ApiError(409, "Artist is already deactivated", [], "")
    }

    const deactiveArtist = await  ArtistModel.findByIdAndUpdate(
        artistId,
        {
            isActive: false
        },
        { new: true }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, deactiveArtist, "Artist profile deactivated successfully"))

})

export {
    applyForArtist,
    approveArtist,
    rejectArtist,
    verifyArtist,
    getAllApplications,
    updateArtistProfile,
    getArtistProfile,
    getAllArtists,
    deactivateArtist
}