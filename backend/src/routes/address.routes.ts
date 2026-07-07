import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { 
    createAddress, 
    deleteAddress, 
    getUserAddress,
    updateAddress
} from "../controllers/address.controller.js";

const router = Router()

router
.route("/")
.post(
    verifyJWT,
    createAddress
)

router
.route("/:addressId")
.get(
    verifyJWT,
    getUserAddress
)

router
.route("/:addressId")
.patch(
    verifyJWT,
    updateAddress
)

router
.route("/:addressId")
.delete(
    verifyJWT,
    deleteAddress
)

export default router