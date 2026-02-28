import { type Request } from "express"

export type MulterRequest = Request & {
    file?: Express.Multer.File | undefined        // for single file upload
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined     // for multiple file uploads
}