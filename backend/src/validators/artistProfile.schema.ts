import z from "zod"

const ArtistProfileZodSchema = z.object({
    displayName: z
        .string()
        .trim(),
    specialization: z
        .array(
            z.string()
        ),
    isVerified: z
        .boolean(),
    totalSales: z
        .number()
        .positive()
        .min(0),
    profileImage: z
        .string(),
    isActive: z
        .boolean(),
    bio: z
        .string()
        .trim()
        .max(500, "Bio cannot exceed 500 characters")
        .optional(),
    portfolioURLs: z
        .array(
            z.string().url()
        )
        .max(10, "Max 10 portfolio URLs")
        .optional(),
    socialLinks: z
        .array(
            z.string().url()
        )
        .max(5, "Max 5 social links")
        .optional(),
})

export { ArtistProfileZodSchema }
export type ArtistInput = z.infer<typeof ArtistProfileZodSchema>