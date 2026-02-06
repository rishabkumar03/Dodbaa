// ============================= Used to validate products details ==========================

import z from "zod"

const ProductZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, {message: "Product name should have atleast 10 characters"}),
    description: z
        .string()
        .trim()
        .min(10, {message: "Product description should have atleast 10 characters"}), 
    images: z
        .array(z.string().url({message: "Image must be a valid url"}))
        .min(2, { message: "Product images shold contains atleast 2 content." }),
    price: z
        .number()
        .positive({message: "Price must be greater than 0"})
        .min(99),
    avgRating: z
        .number()
        .min(1)
        .max(5)
        .optional(),
    isAvailable: z
        .boolean()
        .default(true),
    category: z
        .string()
        .optional(),
    subcategories: z
        .string()
        .optional()
})

export type ProductInput = z.infer<typeof ProductZodSchema>;