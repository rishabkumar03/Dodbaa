// ============================= Used to validate feedback details =============================

import z from "zod"

const FeedbackZodSchema = z.object({
    rating: z
        .number()
        .min(1)
        .max(5),

    comment: z
        .string()
        .trim()
        .optional(),
    isPurchaseVerified: z
        .boolean(),
    feedbackUserId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
        
    feedbackProductId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID")
})

export { FeedbackZodSchema }
export type FeedbackInput = z.infer<typeof FeedbackZodSchema>;