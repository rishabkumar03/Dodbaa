import mongoose, { Types } from "mongoose";
import { OrderModel } from "../models/orders.model.js";
import { OrderZodSchema } from "../validators/orders.schema.js";
import {
    ApiError,
    ApiResponse,
    asyncHandler,
} from "../utils/modules.js"
import { ProductModel } from "../models/product.model.js";
import { OrderItemModel } from "../models/orderItems.model.js";

// Create Order
const createOrder = asyncHandler(async (req, res) => {

    // Step 1 — validate userId from params
    const { userId } = req.params
    if (!userId || typeof (userId) !== "string") {
        throw new ApiError(400, "UserId is required")
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Ivalid userId")
    }

    // Step 2 — validate request body
    // Frontend must send: { products: [{ productId, quantity }], addressId }
    const { products, addressId } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        throw new ApiError(400, "Products are required")
    }
    if (!addressId || !mongoose.Types.ObjectId.isValid(addressId)) {
        throw new ApiError(400, "addressId is required")
    }

    // Step 3 — validate each product exists and get its price
    const productDetails = await Promise.all(
        products.map(async (item: { productId: string, quantity: number }) => {
            // validate productId and quantity
            if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
                throw new ApiError(400, "Invalid Product Id")
            }
            if (!item.quantity || item.quantity < 1) {
                throw new ApiError(400, "Minimum quantity should be 1")
            }

            const product = await ProductModel.findById(item.productId)
            if (!product) {
                throw new ApiError(404, "Product Not found")
            }
            if (!product.isAvailable) {
                throw new ApiError(404, "Product out of stock")
            }

            return {
                productId: product._id,
                priceAtPurchase: product.price,
                quantity: item.quantity
            }
        })
    )

    // step 4 - calculate total amount
    const totalAmount = productDetails.reduce((sum, item) => {
        return sum + (item.priceAtPurchase * item.quantity)
    }, 0)

    const newOrder = await OrderModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        items: [],
        totalAmount: totalAmount,
        orderStatus: "Order Placed",
        userAddress: new mongoose.Types.ObjectId(addressId),
    })
    if (!newOrder) {
        throw new ApiError(500, "Something went wrong while creating an order")
    }

    const orderItem = await Promise.all(
        productDetails.map(item => OrderItemModel.create({
            orderId: newOrder._id,
            productId: item.productId,
            priceAtPurchase: item.priceAtPurchase,
            quantity: item.quantity
        }))
    )

    if (!orderItem) {
        await OrderModel.findByIdAndDelete(newOrder._id)
        throw new ApiError(500, "Something went wrong while creating an orderItems")
    }

    newOrder.items = orderItem.map(item => item._id as mongoose.Types.ObjectId)
    await newOrder.save()

    const populatedOrder = await OrderModel.findById(newOrder._id)
        .populate("items")
        .populate("userId", "fullname email")
        .lean();

    return res.status(201).json(
        new ApiResponse(201, populatedOrder, "Order created successfully")
    )
})

// Delete Order
const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId, userId } = req.params

    if (!userId || !orderId || typeof userId !== "string" || typeof orderId !== "string") {
        throw new ApiError(400, "UserId and OrderId are required")
    }

    const existingOrder = await OrderModel.findOne({
        _id: new mongoose.Types.ObjectId(orderId),
        userId: new mongoose.Types.ObjectId(userId)
    })

    if (!existingOrder) {
        throw new ApiError(404, "No existing order")
    }

    if (["Order Shipped", "Order Delivered"].includes(existingOrder.orderStatus)) {
        throw new ApiError(400, `Cannot delete order with status: ${existingOrder.orderStatus}`)
    }

    // delete orderItems
    await OrderItemModel.deleteMany(existingOrder._id)

    const deletedOrder = await OrderModel.findOneAndDelete(existingOrder._id);
    if (!deletedOrder) {
        throw new ApiError(500, "Something went wrong while deleting the order")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedOrder,
            "Order deleted successfully"
        )
    )
})

// Get All Orders
const getAllOrders = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId || typeof userId !== "string") {
        throw new ApiError(400, "UserId is required")
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, 'Invalid userId')
    }

    const orders = await OrderModel.find({
        userId: new mongoose.Types.ObjectId(userId)
    }).populate("items").populate("userAddress").lean()

    if (orders.length === 0) {
        throw new ApiError(404, "No orders found for this user")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            orders,
            "Orders fetched successfully"
        )
    )
})

export {
    createOrder,
    deleteOrder,
    getAllOrders
}