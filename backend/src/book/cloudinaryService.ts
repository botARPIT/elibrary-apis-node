import cloudinary from "../config/cloudinary.js"
import { generatePublicId } from "../utils/generatePublicId.js"
import { logger } from "../utils/logger.js"

class CloudinaryService {
    async uploadBookCover(
        coverImageMimeType: string,
        coverImageFileName: string,
        coverImageFilePath: string
    ) {
        const coverImageUploadResult = await cloudinary.uploader.upload(coverImageFilePath, {
            filename_override: coverImageFileName as string,
            folder: "book-covers",
            type: 'authenticated',
            format: coverImageMimeType as string,
        })
        return coverImageUploadResult.secure_url
    }

    async uploadBookPdf(
        bookFileMimeType: string,
        bookFileName: string,
        bookFilePath: string
    ) {
        const bookFileUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName as string,
                folder: "book-pdfs",
                type: 'authenticated',
                format: bookFileMimeType as string,
            })
        return bookFileUploadResult.secure_url
    }

    async deleteAsset(assetUrl: string) {
        const publicId = generatePublicId(assetUrl)
        if (publicId.includes(".pdf")) {
            return await cloudinary.uploader.destroy(publicId, {
                resource_type: 'raw', invalidate: true, type: 'authenticated'
            }).then((result) => { logger.debug({ result, publicId }, 'Asset deleted') })
        }
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image', invalidate: true, type: 'authenticated'
        }).then((result) => { logger.debug({ publicId, result }, 'Asset deleted') })
    }

}


export const cloudinaryService = new CloudinaryService()