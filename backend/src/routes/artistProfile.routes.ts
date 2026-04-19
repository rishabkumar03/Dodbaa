import { Router } from "express";
import {
    applyForArtist,
    approveArtist,
    rejectArtist,
    verifyArtist,
    getAllApplications,
    updateArtistProfile,
    getArtistProfile,
    getAllArtists,
    deactivateArtist    
} from "../controllers/artistProfile.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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
.route("/aa/:artistId")
.patch(
    verifyJWT,
    approveArtist
)

router
.route("/ra/:artistId")
.patch(
    verifyJWT,
    rejectArtist
)

router
.route("/va/:artistId")
.patch(
    verifyJWT,
    verifyArtist
)

router
.route("/applications")
.get(
    verifyJWT,
    getAllApplications
)

router
.route("/update/:artistId")
.patch(
    verifyJWT,
    updateArtistProfile
)

router
.route("/a/:artistId")
.get(
    verifyJWT,
    getArtistProfile    
)

router
.route("/all-artists")
.get(
    verifyJWT,
    getAllArtists
)

router
.route("/d/:artistId")
.post(
    verifyJWT,
    deactivateArtist
)

export default router