// ============================= Used to validate req.body =============================

import z from "zod"

const UserZodSchema = z.object({
    fullname: z
        .string()
        .trim()
        .min(2, { message: "Fullname should have atleast 2 characters" })
        .max(30),

    email: z
        .string()
        .email({ message: "Please enter a valid email" }),

    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),

    phone: z
        .string()
        .regex(/^(?:\+91|91)?[6-9]\d{9}$/, { message: "Please enter a valid Phone Number" }),
})

// It will be used in login Functionality

const LoginZodSchema = UserZodSchema

    // .pick() prefers only listed fields inside it.
    .pick({ email: true, phone: true, password: true })

    // .partial() works as an optional 
    .partial({ email: true, phone: true })

    // .refine() works as a custom validation logic
    .refine(data => data.email || data.phone, {
        message: "Email or phone is required"
    })

// It will be used in changeCurrentPassword functionality
const PasswordChangeSchema = z.object({

    // .shape() access individual field validators
    oldPassword: UserZodSchema.shape.password,
    newPassword: UserZodSchema.shape.password
})

export { UserZodSchema, LoginZodSchema, PasswordChangeSchema }

export type UserInput = z.infer<typeof UserZodSchema>;
export type LoginInput = z.infer<typeof LoginZodSchema>;
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>;