import z from "zod"

const ArtistApplicationZodSchema = z.object({
    displayName: z
        .string()
        .trim()
        .min(2, "Display name must be at least 2 characters")
        .max(50, "Display name cannot exceed 50 characters"),
    bio: z
        .string()
        .trim()
        .max(500, "Bio cannot exceed 500 characters")
        .optional(),
    specialization: z
        .array(
            z
            .string()
            .trim()
        )
        .min(1, "Add at least one specialization"),
    portfolioURLs: z
        .array(
            z
            .string()
            .url("Each porfolio URL must be valid")
        )
        .max(10, "Max 10 portfolio URLs allowed")
        .optional(),
    socialLinks: z
        .array(
            z
            .string()
            .url("Each social link must be valid")
        )
        .max(5, "Max 5 social links allowed")
        .optional()
})

const UpdateArtistProfileSchema = ArtistApplicationZodSchema.partial()

const RejectionArtistZodSchema = z.object({
    rejectionReason: z
        .string()
        .trim()
        .min(10, "Please provide a proper reason")
})

export {ArtistApplicationZodSchema, UpdateArtistProfileSchema, RejectionArtistZodSchema}

export type ArtistApplicationInput = z.infer<typeof ArtistApplicationZodSchema>
export type UpdateArtistProfileInput = z.infer<typeof UpdateArtistProfileSchema>
export type RejectionArtistInput = z.infer<typeof RejectionArtistZodSchema>