import mongoose from "mongoose";
import z from "zod";

const cartZodSchema = z.object({
    productDetails: z.array(
        z.object(
            {
                productId: z
                    .string()
                    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
                        message: "Invalid ObjectId format",
                    }),
                productName: z.string({ message: "Product Name is required" }),
                productDesc: z.string({ message: "Product Description is required" }),
                productPrict: z.number({ message: "Product Prict is required" }).min(1),
                quantity: z.number({ message: "Product Quantity is required" }).min(1),
            }
        )
    ),
    couponValue: z.number().min(1).max(100),
    totalPrice: z.number().min(1)
})

export const UpdateCartZodSchema = cartZodSchema.partial()

export { cartZodSchema }