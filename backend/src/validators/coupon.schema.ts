import z from "zod";
const couponZodSchema = z.object({
    couponName: z.string({ message: "Coupon name is required" }),
    couponValue: z.number({ message: "Coupon value is required" }),
    couponExpiry: z.date({ message: "Coupon expiry is required" })
})

export const UpdateCouponZodSchema = couponZodSchema
    .partial()
    .refine(d => d.couponExpiry !== undefined, {
        message: "coupon expiry can't be empty",
        path: ["couponExpiry"]
    })

export { couponZodSchema }