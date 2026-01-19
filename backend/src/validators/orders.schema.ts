import z from "zod"

const OrderZodSchema = z.object({
    userId: z.string().trim().min(1, { message: "UserId is required" }),
    totalAmount: z.number().min(0, { message: "Total Amount should be gerater than 0" }),
    orderStatus: z.enum(["Order Placed", "Order Shipped", "Order Delivered"]),
    category: z.enum(["ceramics", "keychains", "paintings", "sculptures", "others"])
})

export type OrderInput = z.infer<typeof OrderZodSchema>;