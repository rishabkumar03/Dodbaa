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
.route("/add-category")
.post(
    verifyAdmin,
    upload.fields([
        {
            name: "images",
            maxCount: 3
        }
    ]),
    addCategory
)

export default router