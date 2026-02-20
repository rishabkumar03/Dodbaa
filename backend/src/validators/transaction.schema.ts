// ============================= Used to validate transaction details =============================

import z from "zod"
        
const TransactionZodSchema = z.object({
    paymentMethod: z
        .enum(["COD", "Online"]),
    paymentStatus: z
        .enum(["Pending", "Success", "Failed"]),
    paymentGatewayId: z
        .string()
        .trim()
        .optional(),
    paymentOrderId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Order ID"),
    paymentUserId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
})

export type TransactionInput = z.infer<typeof TransactionZodSchema>;