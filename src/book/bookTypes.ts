import type { UserDTO } from "../user/userTypes.js";
import { z } from 'zod'
import { sanitizeInput } from "../utils/sanitize.js";
export interface BookInfo {
    _id: string,
    title: string,
    author: UserDTO,
    genre: BookGenre,
    coverImage: string,
    file: string,
    createdAt: Date,
    updatedAt: Date

}
export type BookMetaData = {
    coverImageMimeType: string,
    coverImageFileName: string,
    coverImageFilePath: string,
    bookFileMimeType: string,
    bookFileName: string,
    bookFilePath: string
}
export enum BookGenre {
    MYTHOLOGICAL = "Mythological",
    STORY = "Story",
    NOVEL = "Novel",
    FICTION = "Fiction",
    SCIENCE_FICTION = "Science Fiction",
    POEM = "Poem",
    THRILLER = "Thriller",
    FANTASY = "Fantasy",
    NON_FICTION = "Non Fiction",
    HORROR = "Horror",
    ROMANCE = "Romance",
    COMIC = "Comic"
}

export const createBookSchema = z.object({
    title: z.string().min(2).max(80).transform((val) => sanitizeInput(val)),
    author: z.string().min(1).max(100).transform((val) => sanitizeInput(val)),
    genre: z.enum(BookGenre)
})

export const updateBookSchema = z.object({
    title: z.string().min(2).max(80).transform((val) => sanitizeInput(val)).optional(),
    author: z.string().min(1).max(100).transform((val) => sanitizeInput(val)),
    genre: z.enum(BookGenre).optional()
})

export const bookIdSchema = z.string().transform((val) => sanitizeInput(val))


export type fileUploadType = { [fieldname: string]: Express.Multer.File[]; }

export type BookDTO = BookInfo
export type CreatedBookDTO = BookDTO
export type UpdateBookDTO = Partial<Pick<BookInfo, "title" | "genre">>
export type UpdateCoverImageMetaData = Partial<Pick<BookMetaData, "coverImageFileName" | "coverImageFilePath" | "coverImageMimeType">>