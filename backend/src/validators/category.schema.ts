import z from "zod"

const CategoryBaseSchema = z.object({
    name: z
        .string()
        .trim()
        .min(3, { message: "Category name should have at least 3 characters" }),
    description: z
        .string()
        .trim()
        .min(10, { message: "Description should have at least 10 characters" })
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
        .min(1, { message: "At least one image is required" }),
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format"),
    level: z
        .coerce.number()
        .min(1)
        .max(3),
    parent: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid parent ID")
        .optional()
        .nullable()
})

const parentLevelRefine = (data: any) => {
    if (data.level === 1 && data.parent) {
        return false;
    } 

    if (data.level && data.level > 1 && !data.parent) {
        return false;
    } else {
        return true;
    }
}

const parentLevelRefineConfig = {
    message: "Level 1 categories cannot have a parent. Level 2 and 3 must have a parent",
    path: ["parent"]
}

export const CategoryZodSchema = CategoryBaseSchema
    .refine(parentLevelRefine, parentLevelRefineConfig)

export const UpdateCategoryZodSchema = CategoryBaseSchema
    .partial()
    .refine(parentLevelRefine, parentLevelRefineConfig)

export type CategoryInput = z.infer<typeof CategoryZodSchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryZodSchema>