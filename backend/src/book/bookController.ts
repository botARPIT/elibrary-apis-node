import type { NextFunction, Request, Response } from "express";
import * as fs from 'node:fs/promises'
import { bookIdSchema, createBookSchema, updateBookSchema, type fileUploadType, type UpdateCoverImageMetaData } from "./bookTypes.js";
import createHttpError from "http-errors";
import { bookService } from "./bookService.js";
import type { AuthRequest } from "../middlewares/authenticator.js";
import { multerFileUpload, multerUploadBookFile, multerUploadCoverImage } from "./multerFileUpload.js";
import { logger } from "../utils/logger.js";
import { generateRedisKey, getRedisClient } from "../config/redis.js";

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique book identifier
 *           example: "67a7b8c9d1e2f3a4b5c6d7e8"
 *         title:
 *           type: string
 *           description: Book title
 *           example: "The Monkey King"
 *         genre:
 *           type: string
 *           description: Book genre/category
 *           example: "Fiction"
 *         author:
 *           type: string
 *           description: Author ID reference
 *           example: "64a7b8c9d1e2f3a4b5c6d7e9"
 *         coverImage:
 *           type: string
 *           format: uri
 *           description: URL to book cover image
 *           example: "https://cdn.example.com/covers/book.jpg"
 *         file:
 *           type: string
 *           format: uri
 *           description: URL to book PDF file
 *           example: "https://cdn.example.com/books/book.pdf"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-07-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2023-07-15T10:30:00Z"
 * 
 *     Pagination:
 *       type: object
 *       description: Pagination metadata for paginated responses
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: Current page number (1-based)
 *           minimum: 1
 *           example: 2
 *         totalPages:
 *           type: integer
 *           description: Total number of pages available
 *           minimum: 0
 *           example: 10
 *         totalBooks:
 *           type: integer
 *           description: Total number of books in the collection
 *           minimum: 0
 *           example: 95
 *         hasNextPage:
 *           type: boolean
 *           description: Whether there are more pages after the current page
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           description: Whether there are pages before the current page
 *           example: true
 *         limit:
 *           type: integer
 *           description: Maximum number of books per page
 *           minimum: 1
 *           maximum: 100
 *           example: 10
 * 
 *     CreateBookRequest:
 *       type: object
 *       required:
 *         - title
 *         - genre
 *         - coverImage
 *         - file
 *       properties:
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Book title
 *           example: "The Monkey King"
 *         genre:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Book genre/category
 *           example: "Fiction"
 *         coverImage:
 *           type: string
 *           format: binary
 *           description: Book cover image (JPEG, PNG, WebP)
 *         file:
 *           type: string
 *           format: binary
 *           description: Book PDF file
 * 
 *     CreateBookResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Book uploaded successfully"
 *             created_book_id:
 *               type: string
 *               example: "67a7b8c9d1e2f3a4b5c6d7e8"
 *             cover_url:
 *               type: string
 *               format: uri
 *               example: "https://cdn.example.com/covers/book.jpg"
 *             book_url:
 *               type: string
 *               format: uri
 *               example: "https://cdn.example.com/books/book.pdf"
 *
 *     UpdateBookRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Updated book title
 *           example: "Journey to the West"
 *         genre:
 *           type: string
 *           description: Updated book genre
 *           example: "Adventure"
 *         coverImage:
 *           type: string
 *           format: binary
 *           description: New book cover image
 *         file:
 *           type: string
 *           format: binary
 *           description: New book PDF file
 *
 *     UpdateBookResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             book:
 *               $ref: '#/components/schemas/Book'
 *
 *     GetBookByIdRequest:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *           description: ID of the book to retrieve
 *           example: "67a7b8c9d1e2f3a4b5c6d7e8"
 *
 *     GetBookResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             book:
 *               $ref: '#/components/schemas/Book'
 * 
 *     GetBooksRequest:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           description: Page number for pagination (1-based)
 *           minimum: 1
 *           default: 1
 *           example: 2
 *         limit:
 *           type: integer
 *           description: Number of books per page
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *
 *     GetBooksResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             books:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *             pagination:
 *               $ref: '#/components/schemas/Pagination'
 *       example:
 *         success: true
 *         data:
 *           books:
 *             - _id: "67a7b8c9d1e2f3a4b5c6d7e8"
 *               title: "The Monkey King"
 *               genre: "Fiction"
 *               author: "64a7b8c9d1e2f3a4b5c6d7e9"
 *               coverImage: "https://cdn.example.com/covers/book.jpg"
 *               file: "https://cdn.example.com/books/book.pdf"
 *               createdAt: "2023-07-15T10:30:00Z"
 *               updatedAt: "2023-07-15T10:30:00Z"
 *             - _id: "67a7b8c9d1e2f3a4b5c6d7e9"
 *               title: "Journey to the West"
 *               genre: "Adventure"
 *               author: "64a7b8c9d1e2f3a4b5c6d7ea"
 *               coverImage: "https://cdn.example.com/covers/journey.jpg"
 *               file: "https://cdn.example.com/books/journey.pdf"
 *               createdAt: "2023-07-16T14:20:00Z"
 *               updatedAt: "2023-07-16T14:20:00Z"
 *           pagination:
 *             currentPage: 2
 *             totalPages: 10
 *             totalBooks: 95
 *             hasNextPage: true
 *             hasPreviousPage: true
 *             limit: 10
 *
 *     DeleteBookRequest:
 *       type: object
 *       properties:
 *         bookId:
 *           type: string
 *           description: ID of the book to delete
 *           example: "67a7b8c9d1e2f3a4b5c6d7e8"
 *
 *     DeleteBookResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Book deleted successfully"
 *
 *     BookErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 400
 *         message:
 *           type: string
 *           description: Human-readable error message
 *           example: "Kindly provide all required fields"
 */


const invalidateBookCache = async () => {
    try {
        const client = await getRedisClient();
        if (!client) {
            logger.warn("Redis client not available, skipping cache invalidation");
            return;
        }
        const cursor = client.scanIterator({
            MATCH: 'book:*',
            COUNT: 100
        });

        for await (const key of cursor) {
            await client.del(key);
        }
    } catch (error) {
        logger.error({ error }, "Failed to invalidate book cache")
    }
}

/**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Create a new book
 *     description: Upload a new book with cover image and PDF file
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/CreateBookRequest'
 *     responses:
 *       '201':
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBookResponse'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 */
const createBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const requestId = req.id.toString()
        const { title, genre } = req.body
        const _req = req as AuthRequest
        const authorId = _req.sub.id
        req.log.info(
            { userId: authorId },
            "Incoming request for create book endpoint"
        )
        if (!title || !genre || !authorId) {
            req.log.error(
                { userId: authorId },
                "Unable to create book due to missing input fields"
            )
            return next(createHttpError(400, "Kindly provide all required fields"))
        }
        const parsedInput = createBookSchema.safeParse({ title, author: authorId, genre })
        if (!parsedInput.success) {
            req.log.error(
                { title: title, genre: genre, userId: authorId, issues: parsedInput.error.issues },
                "Zod validation failed"
            )
            return next(createHttpError(400, parsedInput.error))
        }
        const bookMetaData = await multerFileUpload(req)

        if (!bookMetaData) {
            req.log.error(
                { userId: authorId },
                "Failed to locate the coverImage / bookPdf"
            )

            return next(createHttpError(404, "Unable to locate the file"))
        }
        const {
            coverImageMimeType,
            coverImageFileName,
            coverImageFilePath,
            bookFileMimeType,
            bookFileName,
            bookFilePath
        } = bookMetaData
        const { _id, coverUrl, bookUrl } = await bookService.createBook(
            title,
            genre,
            authorId,
            coverImageMimeType,
            coverImageFileName,
            coverImageFilePath,
            bookFileMimeType,
            bookFileName,
            bookFilePath,
            requestId
        )
        if (!coverUrl || !bookUrl) {
            req.log.error(
                { userId: authorId, bookMetaData: bookMetaData },
                "Book service failed to upload the book"
            )

            return next(createHttpError(400, "Unable to upload files, kindly retry"))
        }
        if (coverImageFilePath) await fs.unlink(coverImageFilePath)
        if (bookFilePath) await fs.unlink(bookFilePath)

        await invalidateBookCache()

        req.log.info(
            { userId: authorId, bookId: _id },
            "Book created successfully"
        )
        return res.status(201).json({
            success: true,
            data: {
                message: "Book uploaded successfully",
                created_book_id: _id,
                cover_url: coverUrl,
                book_url: bookUrl
            }
        })
    } catch (error) {
        if (error instanceof Error) {
            const _req = req as AuthRequest
            const authorId = _req.sub.id
            req.log.error({
                userId: authorId,
                error: error,
                operation: 'create_book '
            }, 'Book creation failed')
            next(createHttpError(500, error.message))
        }
        else
            next(error)
    }
}

/**
 * @swagger
 * /api/books/{bookId}:
 *   put:
 *     summary: Update an existing book
 *     description: Update book details and optionally replace files
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               genre:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     book:
 *                       $ref: '#/components/schemas/Book'
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 */

const updateBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = req.params.bookId;
        const _req = req as AuthRequest
        const requestId = req.id.toString()
        const authorId = _req.sub.id
        req.log.info(
            { userId: authorId, bookId: bookId },
            "Incoming request for update book endpoint"
        )
        if (!bookId) {
            req.log.error(
                { userId: authorId },
                "Book id not provided by the user in params"
            )
            return next(createHttpError(400, "Kindly provide book id"))
        }
        const { title, genre } = req.body


        const parsedInput = updateBookSchema.safeParse({ title, author: authorId, genre })
        if (!parsedInput.success) {
            req.log.error(
                { title: title, genre: genre, userId: authorId, issues: parsedInput.error.issues },
                "Zod validation failed"
            )
            return next(createHttpError(400, parsedInput.error))
        }
        const files = req.files as fileUploadType
        let coverImageMetaData: UpdateCoverImageMetaData | undefined;
        let bookFileMetaData;
        if (files.coverImage) {
            coverImageMetaData = await multerUploadCoverImage(req)

            if (!coverImageMetaData) {
                req.log.error(
                    { userId: authorId },
                    "Failed to locate the coverImage"
                )
                return next(createHttpError(404, "Unable to upload cover image"))
            }
        }
        if (files.file) {
            bookFileMetaData = await multerUploadBookFile(req)

            if (!bookFileMetaData) {
                req.log.warn(
                    { userId: authorId },
                    "Failed to locate the bookPdf"
                )
                return next(createHttpError(404, "Unable to upload book pdf"))
            }
        }
        if (
            !title
            && !genre
            && !coverImageMetaData?.coverImageMimeType
            && !coverImageMetaData?.coverImageFileName
            && !coverImageMetaData?.coverImageFilePath
            && !bookFileMetaData?.bookFileMimeType
            && !bookFileMetaData?.bookFileName
            && !bookFileMetaData?.bookFilePath
        ) {
            req.log.warn(
                { userId: authorId },
                "No input provided by the user"
            )
            return next(createHttpError(400, "Missing input fields"))
        }

        const updatedBook = await bookService.updateBook(
            bookId,
            authorId,
            { title, genre },
            coverImageMetaData?.coverImageMimeType,
            coverImageMetaData?.coverImageFileName,
            coverImageMetaData?.coverImageFilePath,
            bookFileMetaData?.bookFileMimeType,
            bookFileMetaData?.bookFileName,
            bookFileMetaData?.bookFilePath,
            requestId
        )
        if (coverImageMetaData?.coverImageFilePath) await fs.unlink(coverImageMetaData?.coverImageFilePath)
        if (bookFileMetaData?.bookFilePath) await fs.unlink(bookFileMetaData?.bookFilePath)

        if (!updatedBook) {
            req.log.error(
                { userId: authorId },
                "Book service failed to update the book"
            )
            return next(createHttpError(500, "Unable to update the book"))
        }

        await invalidateBookCache()

        req.log.info(
            { userId: authorId, bookId: updatedBook._id },
            "Book updated successfully"
        )
        return res.status(200).json({
            success: true,
            data: {
                book: updatedBook
            }
        })
    } catch (error) {
        if (error instanceof Error) {
            const _req = req as AuthRequest
            const authorId = _req.sub.id
            req.log.error({
                userId: authorId,
                error: error,
                operation: 'update_book'
            }, 'Book updation failed')
            next(createHttpError(500, error.message))
        }
        else {
            req.log.error({ error: error }, "Unknown error encountered while getting list of books")
            next(error)
        }

    }
}

/**
 * @swagger
 * /api/books/{bookId}:
 *   get:
 *     summary: Get a book by ID
 *     description: Retrieve detailed information about a specific book
 *     tags: [Books]
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to retrieve
 *     responses:
 *       '200':
 *         description: Book found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBookResponse'
 *       '400':
 *         description: Invalid book ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 */
const getBookById = async (req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const requestId = req.id.toString()
        const bookId = req.params.bookId
        req.log.info(
            { bookId: bookId },
            "Incoming request for getBookById endpoint"
        )
        if (!bookId) {
            req.log.warn(
                { bookId: bookId },
                "No book id provided"
            )
            return next(createHttpError(400, "No book id provided"))
        }
        const parsedInput = bookIdSchema.safeParse(bookId)
        if (!parsedInput.success) {
            req.log.warn(
                { bookId: bookId, issues: parsedInput.error.issues },
                "Zod validation failed"
            )
            return next(createHttpError(400, parsedInput.error))
        }
        const book = await bookService.findBook(bookId, requestId)
        if (!book) {
            req.log.warn(
                { bookId: bookId },
                "Book service cannot find the requested book"
            )
            return next(createHttpError(404, `Cannot find book with id ${bookId}`))
        }

        req.log.info(
            { bookId: bookId },
            "Book found"
        )
        return res.status(200).json(
            {
                success: true,
                data: {
                    book: book
                }
            })
    } catch (error) {
        if (error instanceof Error) {
            const bookId = req.params.bookId
            req.log.error({
                bookId: bookId,
                error: error,
                operation: 'get_book_by_id'
            }, 'Unable to get the requested book')
            next(createHttpError(500, error.message))
        }
        else {
            req.log.error({ error: error }, "Unknown error encountered while getting the book")
            next(error)
        }

    }

}
/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get paginated list of books
 *     description: Retrieve books with pagination support
 *     tags: [Books]
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       '200':
 *         description: Books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBooksResponse'
 *       '400':
 *         description: Invalid page number
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 */

const getBooks = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const requestId = req.id.toString()
        const pageNumber = Number(req.query.page ?? 1)
        req.log.info(
            { pageNumber: pageNumber },
            "Incoming request for getBooks endpoint"
        )
        if (pageNumber < 0 || Number.isNaN(pageNumber)) {

            req.log.warn(
                { pageNumber: pageNumber },
                "Invalid page number requested by user"
            )
            return next(createHttpError(400, "Invalid page number"))
        }

        const authorId = req.query.author as string | undefined


        const redisKey = generateRedisKey(req.url, "book")

        // Get data from redis
        if (redisKey) {
            try {
                const client = await getRedisClient();
                if (client) {
                    const cachedData = await client.get(redisKey)
                    if (cachedData) {
                        return res.status(200).json({
                            success: true,
                            data: JSON.parse(cachedData)
                        })
                    }
                }
            } catch (error) {
                req.log.error({ error }, "Failed to get data from redis cache")
            }

        }

        const data = await bookService.getAllBooks(pageNumber, authorId, requestId)
        if (!data) {
            req.log.warn(
                { pageNumber: pageNumber },
                "Book service failed to get the requested page number"
            )
            return next(createHttpError(404, "Unable to get books"))
        }
        req.log.info(
            { pageNumber: pageNumber },
            "Successfully returned the requested page number"
        )

        if (redisKey) {
            try {
                const client = await getRedisClient();
                if (client) {
                    await client.set(redisKey, JSON.stringify(data), {
                        EX: 3600 // Cache expiry of 1 hour
                    })
                }
            } catch (error) {
                req.log.error({ error }, "Failed to cache data in redis")
            }
        }
        return res.status(200).json({
            success: true,
            data: data
        })
    } catch (error) {
        if (error instanceof Error) {
            const pageNumber = req.query.page
            req.log.error({
                pageNumber: pageNumber,
                error: error,
                operation: 'get_books'
            }, 'Unable to get the requested page number')
            next(createHttpError(500, error.message))
        }
        else {
            req.log.error({ error: error }, "Unknown error encountered while getting the book")
            next(error)
        }
    }
}

/**
 * @swagger
 * /api/books/{bookId}:
 *   delete:
 *     summary: Delete a book
 *     description: Remove a book from the system (owner only)
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID to delete
 *     responses:
 *       '204':
 *         description: Book deleted successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BookErrorResponse'
 * 
 */

const deleteBook = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = req.params.bookId
        const _req = req as AuthRequest
        const requestId = req.id.toString()
        const userId = _req.sub.id
        req.log.info(
            { bookId: bookId, userId: userId },
            "Incoming request for delete book endpoint"
        )
        if (!bookId) {
            req.log.warn(
                { userId: userId, bookId: bookId },
                "User failed to provide book id"
            )
            return next(createHttpError(400, "Kindly provide book Id"))
        }
        const parsedInput = bookIdSchema.safeParse(bookId)
        if (!parsedInput.success) {
            req.log.warn(
                { userId: userId, issues: parsedInput.error.issues },
                "Book service failed to get the requested page number"
            )
            return next(createHttpError(400, parsedInput.error))
        }
        const deletedBook = await bookService.deleteBook(userId, bookId, requestId)
        if (!deletedBook) {
            req.log.warn(
                { userId: userId, bookId: bookId },
                "Book service failed to delete the book"
            )
            return next(createHttpError(400, "Unable to delete the book"))
        }

        await invalidateBookCache()

        req.log.info(
            { userid: userId, bookId: bookId },
            "Successfully deleted the book"
        )
        return res.status(204).end()
    } catch (error) {
        if (error instanceof Error) {
            const _req = req as AuthRequest
            const authorId = _req.sub.id
            const bookId = req.params.bookId
            req.log.error({
                userId: authorId,
                bookId: bookId,
                error: error,
                operation: 'delete_book'
            }, 'Unable to get the requested book')
            next(createHttpError(500, error.message))
        }
        else {
            req.log.error({ error: error }, "Unknown error encountered while deleting the book")
            next(error)
        }
    }

}
export { createBook, updateBook, getBookById, getBooks, deleteBook }