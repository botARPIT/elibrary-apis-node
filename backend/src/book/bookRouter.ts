import express from 'express'
import { createBook, deleteBook, getBookById, getBooks, updateBook } from './bookController.js'
import { authenticator } from '../middlewares/authenticator.js'
import { getFileUploadPath } from './multerFileUpload.js'
import { fileUploadMiddleware } from '../middlewares/fileUploadMiddleware.js'

const bookRouter = express.Router()

bookRouter.post("/upload", authenticator, fileUploadMiddleware, createBook)

bookRouter.patch("/update/:bookId", authenticator, fileUploadMiddleware, updateBook)

bookRouter.get("/id/:bookId", getBookById)

bookRouter.get("/", getBooks)

bookRouter.delete("/:bookId", authenticator, deleteBook)
export { bookRouter }