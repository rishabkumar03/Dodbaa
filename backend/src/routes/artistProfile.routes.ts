import { Router } from "express";
import {
    applyForArtist,
    approveArtist,
    rejectArtist,
    specialArtist,
    getAllApplications,
    updateArtistProfile,
    getArtistProfile,
    getAllArtists,
    deactivateArtist    
} from "../controllers/artistProfile.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyAdmin, verifyArtist, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router
.route("/apply-artist")
.post(
    verifyJWT,
    upload.fields([
        {
            name: "profileImage",
            maxCount: 1
        }
    ]),
    applyForArtist
)

router
.route("/approve/:artistId")
.patch(
    verifyJWT,
    verifyAdmin,
    approveArtist
)

router
.route("/reject/:artistId")
.patch(
    verifyJWT,
    verifyAdmin,
    rejectArtist
)

router
.route("/special/:artistId")
.patch(
    verifyJWT,
    verifyAdmin,
    specialArtist
)

router
.route("/applications")
.get(
    verifyJWT,
    verifyAdmin,
    getAllApplications
)

router
.route("/update/:artistId")
.patch(
    verifyJWT,
    verifyArtist,
    updateArtistProfile
)

router
.route("/:artistId")
.get(
    getArtistProfile     
)

router
.route("/")
.get(
    getAllArtists
)

router
.route("/deactivate/:artistId")
.patch(
    verifyJWT,
    verifyAdmin,
    deactivateArtist
)

export default router