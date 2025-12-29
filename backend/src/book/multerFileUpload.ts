import type { Request } from "express";
import type { fileUploadType } from "./bookTypes.js";
import { config } from "../config/config.js";
import { getDirectoryName } from "../utils/getDirectoryName.js";
import multer from 'multer'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
        console.log("from multer file upload, coverimage file path", coverImageFilePath)
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
        console.log("from multer file upload, book file path", bookFilePath)
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
            limits: { fileSize: config.max_file_size }
        })
    }
    console.log("from get file upload method in multer file upload", fileUploadPath)
    return fileUploadPath
}

export { multerFileUpload, multerUploadCoverImage, multerUploadBookFile, getFileUploadPath }