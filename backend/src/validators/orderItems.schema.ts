import z from "zod"

const OrderItemZodSchema = z.object({
    orderId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID"),
    productId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID"),
    priceAtPurchase: z
        .number()
        .min(1, { message: "Price at purchase amount should be greater than 0" }),
    quantity: z
        .number()
        .min(1, { message: "Quantity should be greater than 0" })
})

export { OrderItemZodSchema }
export type OrderItemInput = z.infer<typeof OrderItemZodSchema>;