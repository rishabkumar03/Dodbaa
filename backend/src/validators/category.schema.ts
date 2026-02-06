// ============================= Used to validate category details =============================

import z from "zod"

const CategoryZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, {message: "Category name should have atleast 3 characters"}),
    slug: z
        .string()
        .trim()
        .min(3, {message: "Slug name should have atleast 3 characters"}),
    level: z
        .number()
        .min(1)
        .max(3),
    parent: z
        .string()
        .optional()
})

export type CategoryInput = z.infer<typeof CategoryZodSchema>;