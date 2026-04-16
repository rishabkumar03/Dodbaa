import { asyncHandler } from "../utils/asyncHandler.js"
import ApiResponse from "../utils/apiResponse.js"
import ApiError from "../utils/apiError.js"
import { TransactionModel } from "../models/transaction.model.js"
import { TransactionZodSchema } from "../validators/transaction.schema.js"
import mongoose from "mongoose"

// ─────────────────────────────────────────
// Create Transaction
// called when order is placed
// ─────────────────────────────────────────
const createTransaction = asyncHandler(async (req, res) => {

    const {
        paymentMethod,
        paymentStatus,
        paymentGatewayId,   // optional — only for online payments
        paymentOrderId
    } = req.body

    // Step 1 — validate required fields
    if (!paymentMethod) throw new ApiError(400, "Payment method is required")
    if (!paymentStatus) throw new ApiError(400, "Payment status is required")
    if (!paymentOrderId) throw new ApiError(400, "Payment order ID is required")

    // Step 2 — validate paymentOrderId is valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentOrderId)) {
        throw new ApiError(400, "Invalid payment order ID")
    }

    // Step 3 — paymentGatewayId is only for online payments, not COD
    if (paymentMethod !== "COD" && !paymentGatewayId) {
        throw new ApiError(400, "Payment gateway ID is required for online payments")
    }

    // Step 4 — attach userId from auth middleware
    req.body.paymentUserId = req.user?._id

    // Step 5 — Zod validation
    const result = TransactionZodSchema.safeParse(req.body)
    if (!result.success) {
        throw new ApiError(400, "Validation failed", result.error.flatten().fieldErrors)
    }

    // Step 6 — check if transaction already exists for this order
    // prevents duplicate transactions for same order
    const existingTransaction = await TransactionModel.findOne({
        paymentOrderId: new mongoose.Types.ObjectId(paymentOrderId)
    })
    if (existingTransaction) {
        throw new ApiError(409, "Transaction already exists for this order")
    }

    // Step 7 — create transaction
    const transactionData = Object.fromEntries(
        Object.entries(result.data)
            .filter(([_, value]) => value !== undefined)
    )
    
    const newTransaction = await TransactionModel.create(transactionData)
    if (!newTransaction) {
        throw new ApiError(500, "Something went wrong while creating transaction")
    }

    return res.status(201).json(
        new ApiResponse(201, newTransaction, "Transaction created successfully")
    )
})

// ─────────────────────────────────────────
// Get Single Transaction
// used for showing payment receipt
// ─────────────────────────────────────────
const getTransaction = asyncHandler(async (req, res) => {

    const { transactionId } = req.params

    if (!transactionId || typeof transactionId !== "string") {
        throw new ApiError(400, "Transaction ID is required")
    }
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new ApiError(400, "Invalid transaction ID")
    }

    const transaction = await TransactionModel.findById(transactionId)
        .populate("paymentOrderId")              // show full order details
        .populate("paymentUserId", "fullname email")  // show user name and email
        .lean()

    if (!transaction) {
        throw new ApiError(404, "Transaction not found")
    }

    return res.status(200).json(
        new ApiResponse(200, transaction, "Transaction fetched successfully")
    )
})

// ─────────────────────────────────────────
// Get All Transactions of a User
// used for showing payment history
// ─────────────────────────────────────────
const getUserTransactions = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if (!userId || typeof userId !== "string") {
        throw new ApiError(400, "User ID is required")
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID")
    }

    const transactions = await TransactionModel.find({
        paymentUserId: new mongoose.Types.ObjectId(userId)
    })
        .populate("paymentOrderId", "totalAmount orderStatus")
        .lean()

    if (transactions.length === 0) {
        throw new ApiError(404, "No transactions found for this user")
    }

    return res.status(200).json(
        new ApiResponse(200, transactions, "Transactions fetched successfully")
    )
})

// ─────────────────────────────────────────
// Update Transaction Status
// called by payment gateway webhook
// Pending → Success or Failed
// ─────────────────────────────────────────
const updateTransactionStatus = asyncHandler(async (req, res) => {

    const { transactionId } = req.params
    const { paymentStatus, paymentGatewayId } = req.body

    if (!transactionId || typeof transactionId !== "string") {
        throw new ApiError(400, "Transaction ID is required")
    }
    if (!mongoose.Types.ObjectId.isValid(transactionId)) {
        throw new ApiError(400, "Invalid transaction ID")
    }
    if (!paymentStatus) {
        throw new ApiError(400, "Payment status is required")
    }

    const validStatuses = ["Pending", "Success", "Failed"]
    if (!validStatuses.includes(paymentStatus)) {
        throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`)
    }

    const existingTransaction = await TransactionModel.findById(transactionId)
    if (!existingTransaction) {
        throw new ApiError(404, "Transaction not found")
    }

    // prevent updating already completed transactions
    if (existingTransaction.paymentStatus === "Success") {
        throw new ApiError(400, "Cannot update a successful transaction")
    }

    const updateData: Record<string, unknown> = { paymentStatus }

    // attach gateway ID if provided (online payment confirmed)
    if (paymentGatewayId) {
        updateData.paymentGatewayId = paymentGatewayId
    }

    const updatedTransaction = await TransactionModel.findByIdAndUpdate(
        transactionId,
        { $set: updateData },
        { new: true }
    )

    return res.status(200).json(
        new ApiResponse(200, updatedTransaction, "Transaction status updated successfully")
    )
})

export {
    createTransaction,
    getTransaction,
    getUserTransactions,
    updateTransactionStatus
}