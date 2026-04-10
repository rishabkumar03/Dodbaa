// ============================= Used to validate wishlist detatils =============================

import z from "zod"

// Only productId - userId always comes from JWT
const WishlistZodSchema = z.object({
    productId: z
        .string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Product ID")
})

export { WishlistZodSchema }
export type WishlistInput = z.infer<typeof WishlistZodSchema>;