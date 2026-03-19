import fs from "fs"
import path from "path"
import multer from "multer"

const TEMP_DIR = "./public/temp"
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, TEMP_DIR)
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname)      
        const name = path.basename(file.originalname, ext)
            .replace(/\s+/g, "-")
            .toLowerCase()
        cb(null, `${name}-${Date.now()}${ext}`)
    }
})

// file type validation
const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only .jpg, .jpeg, .png, .webp files are allowed"))
    }
}

export const upload = multer({
    storage,
    fileFilter,         
    limits: {
        fileSize: 5 * 1024 * 1024,   // 5MB max
        files: 5                       // max 5 files
    }
})