import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

const getCloudinaryClient = () => {
    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
    const api_key = process.env.CLOUDINARY_API_KEY
    const api_secret = process.env.CLOUDINARY_API_SECRET

    if (!cloud_name || !api_key || !api_secret) {
        throw new Error("Cloudinary credentials are missing in .env")
    }

    cloudinary.config({ cloud_name, api_key, api_secret })
    return cloudinary
}

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) {
            return null
        }

        const client = getCloudinaryClient()

        const response = await client.uploader.upload(localFilePath, {
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return response

    } catch (error) {

        console.error("Cloudinary upload error: ", error)
        
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath)
        }
        return null
    }
}

const deleteFromCloudinary = async (publicId: string) => {
    try {
        if (!publicId) {
            return null
        }

        const client = getCloudinaryClient()

        const response = await client.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        console.log("Contents deleted successfully", response);

    } catch (error) {
        console.log("Cloudinary delete error", error);
    
    }
}

export { uploadOnCloudinary, deleteFromCloudinary }