// ============================= Used to validate transaction details =============================

import z from "zod"
        
const TransactionZodSchema = z.object({
    paymentMethod: z
        .string()
        .trim(),
    paymentStatus: z
        .string()
        .trim(),
    paymentGatewayId: z
        .string()
        .trim(),
    paymentOrderId: z
        .string(),
    paymentUserId: z
        .string()
})

export type TransactionInput = z.infer<typeof TransactionZodSchema>;