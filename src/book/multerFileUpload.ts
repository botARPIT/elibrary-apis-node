import type { Request } from "express";
import path from "path";
import type { fileUploadType } from "./bookTypes.js";
import { config } from "../config/config.js";
import { getDirectoryName } from "../utils/getDirectoryName.js";
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
        const coverImageFilePath = path.resolve(__dirname, config.file_upload_directory, coverImageFileName)
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
        const bookFilePath = path.resolve(__dirname, config.file_upload_directory, bookFileName)
        return {
            bookFileName,
            bookFileMimeType,
            bookFilePath
        }
    }
}



export { multerFileUpload, multerUploadCoverImage, multerUploadBookFile }