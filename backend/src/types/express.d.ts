import mongoose from "mongoose"
import { type Request } from "express"

// Express's Request object has fixed fields like body, cookies, headers etc., so basically I added a custom field 'user' which I declared globally

declare global {
    namespace Express {
        interface Request {
            user?: {
                _id: mongoose.Types.ObjectId;
                fullname: string;
                email: string;
                role: "user" | "artist" | "admin";
            }
        }
    }
}

export type MulterRequest = Request & {
    file?: Express.Multer.File | undefined   // for single file upload
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined     // for multiple file uploads
}

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument
        }
    }
}
