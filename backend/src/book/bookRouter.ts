import express from 'express'
import { createBook, deleteBook, getBookById, getBooks, updateBook } from './bookController.js'
import { proxyBookFile, proxyBookCover } from './bookProxyController.js'
import { authenticator } from '../middlewares/authenticator.js'
import { fileUploadMiddleware } from '../middlewares/fileUploadMiddleware.js'

const bookRouter = express.Router()

// Proxy routes (must come before :bookId routes to avoid conflicts)
bookRouter.get("/proxy/file/:bookId", proxyBookFile)
bookRouter.get("/proxy/cover/:bookId", proxyBookCover)

bookRouter.post("/upload", authenticator, fileUploadMiddleware, createBook)

bookRouter.patch("/update/:bookId", authenticator, fileUploadMiddleware, updateBook)

bookRouter.get("/id/:bookId", getBookById)

bookRouter.get("/", getBooks)

bookRouter.delete("/:bookId", authenticator, deleteBook)
export { bookRouter }