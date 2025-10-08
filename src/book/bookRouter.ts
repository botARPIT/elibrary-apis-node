import express from 'express'
import { createBook, deleteBook, getBookById, getBooks, updateBook } from './bookController.js'
import multer from 'multer'
import path from 'node:path'
import { config } from '../config/config.js'
import { fileURLToPath } from 'node:url'
import { authenticator } from '../middlewares/authenticator.js'

const bookRouter = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const fileUpload = multer({
    dest: path.resolve(__dirname, config.file_upload_directory),
    limits: { fileSize: config.max_file_size }
})

bookRouter.post("/", authenticator, fileUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }
]), createBook)

bookRouter.patch("/update/:bookId", authenticator, fileUpload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'file', maxCount: 1 }]), updateBook)

bookRouter.get("/id/:bookId", getBookById)

bookRouter.get("/", getBooks)

bookRouter.delete("/:bookId", authenticator, deleteBook)
export { bookRouter }