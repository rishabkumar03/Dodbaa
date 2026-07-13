import { Router } from "express";
import {
    createCart,
    updateCart,
    deleteCart,
    getAllCartItems
} from "../controllers/cart.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/create")
.post(
    verifyJWT,
    createCart
)

router
.route("/update/:cartId")
.patch(
    verifyJWT,
    updateCart
)

router
.route("/delete/:cartId")
.delete(
    verifyJWT,
    deleteCart
)

router
.route("/")
.get(
    verifyJWT,
    getAllCartItems
)

export default router