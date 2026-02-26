// ============================= Used to validate category details =============================

import z from "zod"

const CategoryZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, { message: "Category name should have atleast 3 characters" }),
    description: z
        .string()
        .trim(),
    image: z
        .string(),
    slug: z
        .string().
        trim().
        regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),

    level: z
        .number()
        .min(1)
        .max(3),
        
    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent ID")
        .optional()
        .nullable()
})

export { CategoryZodSchema }
export type CategoryInput = z.infer<typeof CategoryZodSchema>;