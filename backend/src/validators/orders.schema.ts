import z from "zod"

const OrderZodSchema = z.object({
    userId: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
        .min(1, { message: "UserId is required" }),

    totalAmount: z
        .number()
        .min(0, { message: "Total Amount should be greater than 0" }),

    orderStatus: z
        .enum(["Order Placed", "Order Shipped", "Order Delivered"]),

})

export type OrderInput = z.infer<typeof OrderZodSchema>;