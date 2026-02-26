// ============================= Used to validate products details ==========================

import z from "zod"

const ProductZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(10, { message: "Product name should have atleast 10 characters" }),

    description: z
        .string()
        .trim()
        .min(10, { message: "Product description should have atleast 10 characters" }),

    images: z
        .array(z.string().url({ message: "Image must be a valid url" }))
        .min(2, { message: "Product images shold contains atleast 2 content." }),

    price: z
        .number()
        .positive({ message: "Price must be greater than 99" })
        .gt(99) // minimum ₹99
        .min(1),

    avgRating: z
        .number()
        .min(0)
        .max(5)
        .optional(),

    isAvailable: z
        .boolean()
        .default(true),

    category: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID")
        .optional(),

    subSubCategory: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid Category ID")
        .optional()
})

export { ProductZodSchema }
export type ProductInput = z.infer<typeof ProductZodSchema>;