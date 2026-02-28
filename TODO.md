Learn Redis, SEO, Indexing
install zod
implement DIY features in webpage
sell product like brush, canvas and other materials
```js
address schema {
    address: String,
    alternateAddress: String | optional
    pinCode: String,
    landMark: String,
}
```
implement category and sub category in order model
implement skeleton loading in frontend

<!-- change the name [Order] -> [Cart] -->

25-02-2026: Initially implement Razorpay and upgrade to strip pay for international payments 

26-02-2026: We have to improve pinCode validation in address.schema.ts for global customers.

28-02-2026: Implement two more endpoints which are commented in user.controller.ts, after completions of wishlist and order controllers.




























































# ----------------------------------------------------------------------------------------------

## 1. `.index()` Parameters

```ts
schema.index(fields, options)
```

**Parameter 1 — `fields` object:**
```ts
{ userId: 1, productId: 1 }
//           👆            👆
//     1 = ascending    -1 = descending
```

**Parameter 2 — `options` object (all optional):**
```ts
{
    unique: true,           // no duplicate combinations allowed
    sparse: true,           // skip null values from index (useful for optional fields)
    background: true,       // build index without blocking DB (older Mongo, now default)
    name: "wishlist_idx",   // custom name for the index
    expireAfterSeconds: 3600 // TTL index — auto delete document after N seconds (used for OTPs, sessions)
}
```

---

## 2. The way you've written it is wrong

```ts
// ❌ Your current code — passing schema.index() result as second arg to mongoose.model()
export const WishlistModel = mongoose.model<WishlistDocument>("WishlistModel", WishlistDbSchema.index(
    { userId: 1, productId: 1 },
    { unique: true }
));
```

`WishlistDbSchema.index()` returns the schema itself (for chaining), so it technically works — but it's bad practice and hard to read. The correct way is:

```ts
// ✅ Define index separately, then pass clean schema to model
WishlistDbSchema.index({ userId: 1, productId: 1 }, { unique: true })

export const WishlistModel = mongoose.model<WishlistDocument>("WishlistModel", WishlistDbSchema)
```

---

## 3. Full Fixed `wishlist.model.ts` with Graceful Error Handling

The model itself shouldn't handle errors — that's the controller's job. But you can create a reusable helper to detect duplicate key errors cleanly:

```ts
import mongoose, { Schema, Document } from "mongoose";

export interface WishlistDocument extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
}

const WishlistDbSchema: Schema<WishlistDocument> = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "UserModel",
            required: true
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "ProductModel",
            required: true
        }
    },
    { timestamps: true }
)

// ✅ Clean and separate — easy to read
WishlistDbSchema.index({ userId: 1, productId: 1 }, { unique: true })

export const WishlistModel = mongoose.model<WishlistDocument>("WishlistModel", WishlistDbSchema)
```

Then in your **wishlist controller**:

```ts
import { WishlistModel } from "../models/wishlist.model"

export const addToWishlist = async (req, res) => {
    const { userId, productId } = req.body

    try {
        const wishlistItem = await WishlistModel.create({ userId, productId })

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist",
            data: wishlistItem
        })

    } catch (error: any) {

        // 👇 MongoDB throws error code 11000 for duplicate key violations
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Product is already in your wishlist"
            })
        }

        // All other unexpected errors
        return res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again."
        })
    }
}
```

The flow in plain terms:

```
User adds Product P1 → create() → MongoDB checks index
                                        ↓
                              combination exists? → 11000 error → 409 response
                                        ↓
                              combination new?    → saved ✅   → 201 response
```
