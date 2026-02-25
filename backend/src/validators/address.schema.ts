import z from "zod"

const AddressZodSchema = z.object({
    address: z.string().trim().min(1, { message: "Address cannot be empty" }),
    pinCode: z.string().regex(/^[1-9][0-9]{5}$/, {message: "Invalid pincode"}),
    landmark: z.string().optional(),
})

export type AddressInput = z.infer<typeof AddressZodSchema>