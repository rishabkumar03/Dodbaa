// ============================= Used to validate wishlist detatils =============================

import z from "zod"

const WishlistZodSchema = z.object({
    userId: z
        .string(),
    productId: z
        .string()
})

export type WishlistInput = z.infer<typeof WishlistZodSchema>;