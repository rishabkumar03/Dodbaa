import {v2 as cloudinary} from "cloudinary"
import { log } from "console"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    cloud_key: process.env.CLOUDINARY_API_KEY!,
    cloud_secret: process.env.CLOUDINARY_API_SECRET!
})

const uploadOnCloudinary = async (localFilePath: string) => {
    try {
        if (!localFilePath) {
            return null
        } 
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

const deleteFromCloudinary = async (publicId: string) => {
    try {
        if (!publicId) {
            return null
        }
        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: "auto"
        })
        
        if (!response) {
            console.log("Error while deleting contents on cloudinary");
            return null
        }
    
        console.log("Contents deleted successfully", response);
    } catch (error) {
        console.log("Cloudinary delete error", error);
        
    }  
}

export {uploadOnCloudinary}
export {deleteFromCloudinary}