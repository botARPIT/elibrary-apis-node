import type { Request } from "express";
import type { fileUploadType } from "./bookTypes.js";
import { config } from "../config/config.js";
import { getDirectoryName } from "../utils/getDirectoryName.js";
import { logger } from "../utils/logger.js";
import multer from 'multer'
import path from 'node:path'

async function multerFileUpload(req: Request) {
    const files = req.files as fileUploadType | undefined
    if (!files) {
        return
    }

    const coverImage = await multerUploadCoverImage(req)
    if (!coverImage) { throw new Error("Unable to find cover image") }
    const { coverImageMimeType, coverImageFileName, coverImageFilePath } = coverImage
    const bookFile = await multerUploadBookFile(req)
    if (!bookFile) { throw new Error("Unable to find book pdf") }
    const { bookFileName, bookFileMimeType, bookFilePath } = bookFile

    return {
        coverImageMimeType,
        coverImageFileName,
        coverImageFilePath,
        bookFileName,
        bookFileMimeType,
        bookFilePath
    }

}

async function multerUploadCoverImage(req: Request) {
    const files = req.files as fileUploadType | undefined
    if (!files) {
        return
    }

    const __dirname = getDirectoryName()
    if (files.coverImage) {
        if (!files?.coverImage || files.coverImage.length === 0) { return }
        const coverImageMimeType = files.coverImage[0]?.mimetype.split('/').at(-1) as string
        const coverImageFileName = files.coverImage[0]?.filename as string
        const coverImageFilePath = path.resolve(__dirname, coverImageFileName)
        logger.debug({ coverImageFilePath }, "Cover image file path from multer")
        return {
            coverImageMimeType,
            coverImageFileName,
            coverImageFilePath
        }
    }
}

async function multerUploadBookFile(req: Request) {
    const files = req.files as fileUploadType | undefined
    if (!files) {
        return
    }
    const __dirname = getDirectoryName()
    if (files.file) {
        if (!files?.file || files.file.length === 0) {
            return
        }
        const bookFileName = files.file[0]?.filename as string
        const bookFileMimeType = files.file[0]?.mimetype.split('/').at(-1) as string
        const bookFilePath = path.resolve(__dirname, bookFileName)
        logger.debug({ bookFilePath }, "Book file path from multer")
        return {
            bookFileName,
            bookFileMimeType,
            bookFilePath
        }
    }
}


let fileUploadPath: ReturnType<typeof multer> | null = null
function getFileUploadPath() {
    if (!fileUploadPath) {
        const __dirname = path.resolve(config.file_upload_directory)
        fileUploadPath = multer({
            dest: __dirname,
            limits: {
                fileSize: config.max_file_size,
                files: 2 // Max 2 files (coverImage + PDF)
            },
            fileFilter: (req, file, cb) => {
                // Validate cover image
                if (file.fieldname === 'coverImage') {
                    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                    if (allowedImageTypes.includes(file.mimetype)) {
                        cb(null, true)
                    } else {
                        logger.warn({ mimetype: file.mimetype }, 'Invalid cover image type')
                        cb(new Error(`Invalid cover image format. Allowed: JPEG, PNG, WebP. Got: ${file.mimetype}`))
                    }
                }
                // Validate PDF file
                else if (file.fieldname === 'file') {
                    if (file.mimetype === 'application/pdf') {
                        cb(null, true)
                    } else {
                        logger.warn({ mimetype: file.mimetype }, 'Invalid book file type')
                        cb(new Error(`Invalid book file format. Only PDF allowed. Got: ${file.mimetype}`))
                    }
                }
                else {
                    cb(new Error('Unknown file field'))
                }
            }
        })
    }
    logger.debug("File upload path initialized")
    return fileUploadPath
}

export { multerFileUpload, multerUploadCoverImage, multerUploadBookFile, getFileUploadPath }