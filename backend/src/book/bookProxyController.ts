import type { Request, Response, NextFunction } from 'express'
import createHttpError from 'http-errors'
import { bookService } from './bookService.js'
import { bookIdSchema } from './bookTypes.js'
import { logger } from '../utils/logger.js'

/**
 * @swagger
 * /api/books/proxy/file/{bookId}:
 *   get:
 *     summary: Download/view book PDF (masked CDN URL)
 *     description: Securely serve book PDF without exposing the actual CDN URL
 *     tags: [Books]
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       '200':
 *         description: PDF file streamed
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Book not found
 */
export const proxyBookFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = req.params.bookId
        const requestId = req.id.toString()

        req.log.info(
            { bookId, requestId },
            "Proxying book file request"
        )

        if (!bookId) {
            return next(createHttpError(400, "Book ID is required"))
        }

        // Validate book ID format
        const parsedInput = bookIdSchema.safeParse(bookId)
        if (!parsedInput.success) {
            req.log.warn(
                { bookId, issues: parsedInput.error.issues },
                "Invalid book ID format"
            )
            return next(createHttpError(400, "Invalid book ID format"))
        }

        // Get book details
        const book = await bookService.findBook(bookId, requestId)
        if (!book || !book.file) {
            req.log.warn({ bookId }, "Book or file not found")
            return next(createHttpError(404, "Book not found"))
        }

        // Fetch the PDF from CDN
        const pdfUrl = book.file
        req.log.info({ bookId, maskedUrl: "***" }, "Fetching PDF from CDN")

        const response = await fetch(pdfUrl)

        if (!response.ok) {
            req.log.error({ bookId, status: response.status }, "Failed to fetch PDF from CDN")
            return next(createHttpError(502, "Failed to fetch book file"))
        }

        // Stream the PDF to client
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `inline; filename="${book.title}.pdf"`)

        // Get file buffer and send
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        req.log.info({ bookId, size: buffer.length }, "PDF file proxied successfully")
        res.send(buffer)
    } catch (error) {
        const bookId = req.params.bookId
        logger.error({
            bookId,
            error,
            operation: 'proxy_book_file'
        }, 'Failed to proxy book file')

        if (error instanceof Error) {
            next(createHttpError(500, error.message))
        } else {
            next(error)
        }
    }
}

/**
 * @swagger
 * /api/books/proxy/cover/{bookId}:
 *   get:
 *     summary: Get book cover image (masked CDN URL)
 *     description: Securely serve book cover without exposing the actual CDN URL
 *     tags: [Books]
 *     parameters:
 *       - name: bookId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       '200':
 *         description: Cover image streamed
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       '404':
 *         description: Book not found
 */
export const proxyBookCover = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const bookId = req.params.bookId
        const requestId = req.id.toString()

        req.log.info(
            { bookId, requestId },
            "Proxying book cover request"
        )

        if (!bookId) {
            return next(createHttpError(400, "Book ID is required"))
        }

        // Validate book ID format
        const parsedInput = bookIdSchema.safeParse(bookId)
        if (!parsedInput.success) {
            return next(createHttpError(400, "Invalid book ID format"))
        }

        // Get book details
        const book = await bookService.findBook(bookId, requestId)
        if (!book || !book.coverImage) {
            return next(createHttpError(404, "Book cover not found"))
        }

        // Fetch the image from CDN
        const imageUrl = book.coverImage
        const response = await fetch(imageUrl)

        if (!response.ok) {
            req.log.error({ bookId, status: response.status }, "Failed to fetch cover from CDN")
            return next(createHttpError(502, "Failed to fetch book cover"))
        }

        // Determine content type
        const contentType = response.headers.get('content-type') || 'image/jpeg'

        // Stream the image to client
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=31536000') // Cache for 1 year

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        req.log.info({ bookId, size: buffer.length }, "Cover image proxied successfully")
        res.send(buffer)
    } catch (error) {
        const bookId = req.params.bookId
        logger.error({
            bookId,
            error,
            operation: 'proxy_book_cover'
        }, 'Failed to proxy book cover')

        if (error instanceof Error) {
            next(createHttpError(500, error.message))
        } else {
            next(error)
        }
    }
}
