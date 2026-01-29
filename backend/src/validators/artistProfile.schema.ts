import z, { exactOptional } from "zod"

const ArtistProfileZodSchema = z.object({
    userId: z.string().trim().min(1, { message: "Invalid UserId" }),
    bio: z.string().trim().optional(),
    portfolioURLs: z.string().trim().optional(),
    socialLinks: z.string().trim().optional()
})

export type ArtistInput = z.infer<typeof ArtistProfileZodSchema>