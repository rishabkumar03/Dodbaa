import z from "zod"

const AddressZodSchema = z.object({
    fullAddress: z
        .string(),
    city: z
        .string(),
    state: z
        .string(),
    pinCode: z
        .string()
        .trim(),
    landMark: z
        .string()
        .optional(),
    country: z
        .string(),
    addressType: z
        .enum(["home", "work", "other"]),

    userAddress: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID")
})

export { AddressZodSchema }
export type AddressInput = z.infer<typeof AddressZodSchema>