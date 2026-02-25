// ============================= Used to validate wishlist detatils =============================

import z from "zod"

const WishlistZodSchema = z.object({
    userId: z
        .string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
    productId: z
        .string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID")
})

export type WishlistInput = z.infer<typeof WishlistZodSchema>;