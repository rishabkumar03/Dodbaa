import { Router } from "express";
import {
    addCategory,
    getAllCategories,
    updateCategory,
    searchCategory,
    deleteCategory,
    getCategoryTree
} from "../controllers/category.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/add")
.post(
    verifyJWT,
    verifyAdmin,
    upload.fields([
        {
            name: "images",
            maxCount: 3
        }
    ]),
    addCategory
)

router
.route("/")
.get(
    verifyJWT,
    getAllCategories
)

router
.route("/update/:categoryId")
.patch(
    verifyJWT,
    verifyAdmin,
    updateCategory
)

router
.route("/search")
.get(
    verifyJWT,
    searchCategory
)

router
.route("/delete/:categoryId")
.delete(
    verifyJWT,
    verifyAdmin,
    deleteCategory
)

router
.route("/getTree")
.get(
    verifyJWT,
    getCategoryTree
)

export default router