import { Router } from "express";
import {
    createFeedback,
    getAllFeedbacks,
    updateFeedback,
    deleteFeedback
} from "../controllers/feedback.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/create/:userId/:productId")
.post(
    verifyJWT,
    upload.fields([
        {
            name: "images",
            maxCount: 7
        }
    ]),
    createFeedback
)

router
.route("/")
.get(
    verifyJWT,
    getAllFeedbacks
)

router
.route("/update/:userId/:feedbackId")
.patch(
    verifyJWT,
    upload.fields([
        {
            name: "images",
            maxCount: 7
        }
    ]),
    updateFeedback
)

router
.route("/delete/:feedbackId")
.delete(
    verifyJWT,
    verifyAdmin,
    deleteFeedback
)

export default router