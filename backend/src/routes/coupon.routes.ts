import { Router } from "express";
import {
    setCoupoun,
    deleteCoupon,
    updateCoupon,
    getAllCoupons,
    toggleCouponState,
    searchCoupon
} from "../controllers/coupon .controller.js"
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/set")
.post(
    verifyJWT,
    verifyAdmin,
    setCoupoun
)

router
.route("/delete/:couponId")
.delete(
    verifyJWT,
    verifyAdmin,
    deleteCoupon
)

router
.route("/update/:couponId")
.patch(
    verifyJWT,
    verifyAdmin,
    updateCoupon
)

router
.route("/")
.get(
    verifyJWT,
    verifyAdmin,
    getAllCoupons
)

router
.route("/toggle/:couponId")
.patch(
    verifyJWT,
    verifyAdmin,
    toggleCouponState
)

router
.route("/search")
.get(
    verifyJWT,
    verifyAdmin,
    searchCoupon
)

export default router