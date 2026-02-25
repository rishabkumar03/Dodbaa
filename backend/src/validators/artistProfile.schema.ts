import z from "zod"

const ArtistProfileZodSchema = z.object({
    userId: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),

    bio: z
        .string()
        .trim()
        .optional(),

    portfolioURLs: z
        .array(
            z.string().url({ message: "Each portfolio URL must be a valid URL" })
        )
        .optional(),

    socialLinks: z
        .array(
            z.string().url({ message: "Each social link must be a valid URL" })
        )
        .optional(),
})

export type ArtistInput = z.infer<typeof ArtistProfileZodSchema>