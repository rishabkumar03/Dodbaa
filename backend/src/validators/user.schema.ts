// ======================= Used to validate req.body ==============================

import z from "zod"

const UserZodSchema = z.object({
    fullname: z.string().min(2, { message: "Fullname should have atleast 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    phone: z.string().regex(/^(?:\+91|91)?[6-9]\d{9}$/, { message: "Please enter a valid Phone Number" }),
    role: z.enum(["user", "artist", "admin"]),
    address: z.string().min(1, { message: "Address is required" }),
    resetPasswordOTP: z.string().optional(),
    resetPasswordOTPExpiry: z.date().optional()
})

export type UserInput = z.infer<typeof UserZodSchema>;