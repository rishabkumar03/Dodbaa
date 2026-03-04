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

    images: z
        .array(
            z.object(
                {
                    imageUrl: z.string().url({ message: "Image must be a valid URL" }),
                    publicId: z.string()
                }
            )

        )
        .max(5, { message: "Feedback should contain at max 5 images" })
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

export const UpdatefeedbackZodSchema = FeedbackZodSchema
  .partial()
  .refine(d => d.rating !== undefined && d.comment !== undefined, {
    message: "Both rating and comment are required",
    path: ["rating", "comment"]
  });

export { FeedbackZodSchema }

export type FeedbackInput = z.infer<typeof FeedbackZodSchema>;