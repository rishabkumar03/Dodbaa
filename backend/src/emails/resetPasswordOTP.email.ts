// ── resetPasswordOTP.email.ts ───────────────────────
import { asyncHandler } from "../utils/asyncHandler.js"
import dotenv from "dotenv"
import { Resend } from "resend"
import crypto from "crypto"
import bcrypt from "bcrypt"
import ApiError from "../utils/apiError.js"
import ApiResponse from "../utils/apiResponse.js"
import { UserModel } from "../models/user.model.js"

dotenv.config()

const resend = new Resend(process.env.RESEND_API_KEY)

// extracted helper
function generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString()
}

// validate env var
async function sendOtpEmail(email: string, otp: string) {
    const fromEmail = process.env.SMTP_FROM
    if (!fromEmail) throw new ApiError(500, "SMTP_FROM is not configured")

    await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: "Password Reset OTP",
        html: `
            <h2>Password Reset OTP</h2>
            <p>Your OTP for password reset is: <b>${otp}</b></p>
            <p>This OTP will expire in 5 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `
    })
}

// extracted helper for saving OTP
async function saveOTP(userId: string, otp: string) {
    const hashedOTP = await bcrypt.hash(otp, 10)  // hash OTP
    const expiryDate = new Date(Date.now() + 5 * 60 * 1000)  //  simplified

    await UserModel.findByIdAndUpdate(userId, {
        resetPasswordOTP: hashedOTP,
        resetPasswordOTPExpiry: expiryDate
    })
}

// ─────────────────────────────────────────
// Request OTP
// ─────────────────────────────────────────
const requestOTP = asyncHandler(async (req, res) => {
    const { email, phone } = req.body

    // proper $or query objects
    const orConditions = []
    if (email && typeof email === "string") {
        orConditions.push({ email: email.toLowerCase() })
    }
    if (phone && typeof phone === "string") {
        orConditions.push({ phone })
    }

    if (orConditions.length === 0) {
        throw new ApiError(400, "Email or phone number is required")
    }

    const existingUser = await UserModel.findOne({ $or: orConditions })
    if (!existingUser) {
        throw new ApiError(404, "No account found with this email or phone")
    }

    const otp = generateOTP()
    await saveOTP(existingUser._id.toString(), otp)  // stores hashed OTP

    await sendOtpEmail(existingUser.email, otp)  // send plain OTP to email

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP sent successfully") 
    )
})

// ─────────────────────────────────────────
// Resend OTP
// ─────────────────────────────────────────
const resendOTP = asyncHandler(async (req, res) => {
    const { email } = req.body

    if (!email || typeof email !== "string") {
        throw new ApiError(400, "Valid email is required")  
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (!existingUser) {
        throw new ApiError(404, "No account found with this email")
    }

    // check if previous OTP exists before resending
    if (!existingUser.resetPasswordOTP) {
        throw new ApiError(400, "No OTP request found. Please request a new OTP first.")
    }

    const otp = generateOTP()
    await saveOTP(existingUser._id.toString(), otp)

    await sendOtpEmail(email, otp)

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP resent successfully")
    )
})

// ─────────────────────────────────────────
// Verify OTP
// ─────────────────────────────────────────
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required") 
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (!existingUser) {
        throw new ApiError(404, "No account found with this email")
    }

    if (!existingUser.resetPasswordOTP || !existingUser.resetPasswordOTPExpiry) {
        throw new ApiError(400, "No OTP request found. Please request a new OTP.")
    }

    // check expiry and save
    if (new Date() > existingUser.resetPasswordOTPExpiry) {
        existingUser.resetPasswordOTP = null
        existingUser.resetPasswordOTPExpiry = null
        await existingUser.save()  // actually saves
        throw new ApiError(400, "OTP has expired. Please request a new one.")
    }

    // compare with bcrypt since OTP is hashed
    const isOTPValid = await bcrypt.compare(otp, existingUser.resetPasswordOTP)
    if (!isOTPValid) {
        throw new ApiError(400, "Invalid OTP")
    }

    // clear OTP after successful verification
    existingUser.resetPasswordOTP = null
    existingUser.resetPasswordOTPExpiry = null
    await existingUser.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "OTP verified successfully")
    )
})

// ─────────────────────────────────────────
// Reset Password 
// called after verifyOTP succeeds
// ─────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body

    if (!email || !newPassword || !confirmPassword) {
        throw new ApiError(400, "Email, new password and confirm password are required")
    }

    if (newPassword !== confirmPassword) {
        throw new ApiError(400, "Passwords do not match")
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters")
    }

    const existingUser = await UserModel.findOne({ email: email.toLowerCase() })
    if (!existingUser) {
        throw new ApiError(404, "No account found with this email")
    }

    // prevent setting same password
    const isSamePassword = await bcrypt.compare(newPassword, existingUser.password)
    if (isSamePassword) {
        throw new ApiError(400, "New password cannot be same as old password")
    }

    // bcrypt hash happens in pre-save hook
    existingUser.password = newPassword
    existingUser.refreshToken = null   // invalidate all sessions
    await existingUser.save()

    return res.status(200).json(
        new ApiResponse(200, {}, "Password reset successfully")
    )
})

export {
    requestOTP,
    resendOTP,    
    verifyOTP,
    resetPassword,
    generateOTP
}