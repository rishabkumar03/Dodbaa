import { Router } from "express";
import {
    addProduct,
    updateProduct,
    getAllProducts,
    deleteProduct,
    searchProducts
} from "../controllers/product.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/add")
.post(
    verifyJWT,
    verifyAdmin,
    upload.fields([
        {
            name: "images",
            maxCount: 7
        }
    ]),
    addProduct
)

router
.route("/update/:productId")
.patch(
    verifyJWT,
    verifyAdmin,
    updateProduct
)

router
.route("/")
.get(
    verifyJWT,
    getAllProducts
)

router
.route("/delete/:productId")
.delete(
    verifyJWT,
    verifyAdmin,
    deleteProduct
)

router
.route("/search")
.get(
    verifyJWT,
    searchProducts
)

export default router