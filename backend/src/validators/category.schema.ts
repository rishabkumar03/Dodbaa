import z from "zod"

const CategoryZodSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, { message: "Category name should have at least 3 characters" }),
    description: z
        .string()
        .trim()
        .min(10, { message: "Description should have at least 10 characters" })
        .optional(),
    image: z
        .array(z.string().url({ message: "Image must be a valid URL" }))
        .min(1, { message: "At least one image is required" })
        .optional(),
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    level: z
        .number()
        .min(1)
        .max(3),
    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent ID")
        .optional()
        .nullable()

}).refine((data) => {
    if (data.level === 1 && data.parent) return false
    if (data.level > 1 && !data.parent) return false
    return true
}, {
    message: "Level 1 categories cannot have a parent. Level 2 and 3 must have a parent.",
    path: ["parent"]
})

export { CategoryZodSchema }
export type CategoryInput = z.infer<typeof CategoryZodSchema>