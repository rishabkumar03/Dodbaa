import { type Request } from "express"

export type MulterRequest = Request & {
    file?: Express.Multer.File        // for single file upload
    files?: Express.Multer.File[]     // for multiple file uploads
}