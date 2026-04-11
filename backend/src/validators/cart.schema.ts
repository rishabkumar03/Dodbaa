import mongoose from "mongoose";
import z from "zod";

const cartZodSchema = z.object({
    userId: z.union([
        z.string().refine(val => mongoose.Types.ObjectId.isValid(val), "Invalid ObjectId"),
        z.instanceof(mongoose.Types.ObjectId)
    ]),
    productDetails: z.array(
        z.object(
            {
                productId: z
                    .string()
                    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
                        message: "Invalid ObjectId format",
                    }),
                productName: z.string().min(1, "Product Name is required"),
                productDesc: z.string().optional(),
                productPrice: z.number().min(1, "Product Prict is required"),
                quantity: z.number().min(1, "Product Quantity is required"),
            }
        )
    ).min(1, "Cart must have at least one product"),
    couponValue: z.number().min(0).max(100).optional(),
    totalPrice: z.number().min(1),
    discountedPrice: z.number().min(0).default(0)
})

export const UpdateCartZodSchema = cartZodSchema.partial()

export { cartZodSchema }
