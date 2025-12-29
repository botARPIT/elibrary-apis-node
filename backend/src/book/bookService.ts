import { logger } from "../utils/logger.js"
import { Book } from "./bookModel.js"
import type { BookDTO, BookGenre, UpdateBookDTO } from "./bookTypes.js"
import { cloudinaryService } from "./cloudinaryService.js"

class BookService {

    async createBook(
        title: string,
        genre: BookGenre,
        author: string,
        coverImageMimeType: string,
        coverImageFileName: string,
        coverImageFilePath: string,
        bookFileMimeType: string,
        bookFileName: string,
        bookFilePath: string,
        requestId?: string
    ) {
        try {
            const startTime = performance.now()
            logger.info({
                requestId: requestId,
                title: title,
                genre: genre,
                author: author,
                operation: "create_book"
            }, "create book service started")
            // const coverUrl = await cloudinaryService.uploadBookCover(
            //     coverImageMimeType,
            //     coverImageFileName,
            //     coverImageFilePath,
            // )

            // const bookUrl = await cloudinaryService.uploadBookPdf(
            //     bookFileMimeType,
            //     bookFileName,
            //     bookFilePath
            // )
            const [coverUrl, bookUrl] = await Promise.all([
                cloudinaryService.uploadBookCover(
                    coverImageMimeType,
                    coverImageFileName,
                    coverImageFilePath,
                ),
                cloudinaryService.uploadBookPdf(
                    bookFileMimeType,
                    bookFileName,
                    bookFilePath
                )
            ])
            const book = new Book({
                title,
                author,
                genre,
                coverImage: coverUrl,
                file: bookUrl
            })

            const { _id } = await book.save()
            logger.info({
                requestId: requestId,
                operation: "create_book",
                duration: performance.now() - startTime
            },
                "Book returned"
            )
            const duration = performance.now() - startTime
            if (duration > 3000) {
                logger.warn(
                    {
                        requestId: requestId,
                        operation: "create_book",
                        duration: `${duration.toFixed(2)}ms`
                    }, `Create book service taking ${duration} ms to respond`)
            }

            return { _id, coverUrl, bookUrl }
        } catch (error) {
            logger.error({
                requestId: requestId,
                error: error,
                operation: "create_book"
            },
                "Failed to create book"
            )
            if (error instanceof Error) {
                throw error
            }
            throw new Error("Unable to create new book")
        }
    }


    async findBook(bookId: string, requestId?: string): Promise<BookDTO | null> {
        try {
            const startTime = performance.now()
            logger.info(
                {
                    requestId: requestId,
                    bookId: bookId,
                    operation: "find_book_by_id"
                },
                "Find book service started"
            )
            const book = await Book.findById(bookId).populate('author', 'name email')

            logger.info({
                requestId: requestId,
                bookId: bookId,
                operation: "find_book_by_id",
                duration: performance.now() - startTime
            },
                "Book returned"
            )

            const duration = performance.now() - startTime
            if (duration > 3000) {
                logger.warn(
                    {
                        requestId: requestId,
                        operation: "find_book",
                        duration: `${duration.toFixed(2)}ms`
                    },
                    `Find book service taking ${duration} secs to respond`)
            }
            return book ? book : null
        } catch (error) {
            logger.error({
                requestId: requestId,
                bookId: bookId,
                error: error,
                operation: "find_book_by_id"
            },
                "Failed to find the book"
            )
            if (error instanceof Error) {
                throw error
            }
            throw new Error("Unable to find book")
        }
    }


    async getAllBooks(pageNumber: number, authorId?: string, requestId?: string) {
        try {
            const startTime = performance.now()
            const limit = 10
            logger.info(
                {
                    requestId: requestId,
                    pageNumber: pageNumber,
                    authorId: authorId,
                    operation: "get_all_books"
                },
                "Get all books service started"
            )
            const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * 10

            // Filter by author if provided
            const matchStage = authorId ? { $match: { author: authorId } } : { $match: {} }

            const result = await Book.aggregate([
                matchStage,
                {
                    $facet: {
                        books: [
                            { $sort: { updatedAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $lookup: {
                                    from: 'users',
                                    localField: 'author',
                                    foreignField: '_id',
                                    as: 'authorInfo'
                                }
                            },
                            {
                                $unwind: {
                                    path: '$authorInfo',
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $project: {
                                    title: 1,
                                    genre: 1,
                                    coverImage: 1,
                                    file: 1,
                                    createdAt: 1,
                                    updatedAt: 1,
                                    author: {
                                        _id: '$authorInfo._id',
                                        name: '$authorInfo.name',
                                        email: '$authorInfo.email'
                                    }
                                }
                            }
                        ],
                        totalCount: [
                            { $count: "count" }
                        ]
                    }
                }
            ])

            const books = result[0].books
            const totalBooks = result[0].totalCount.length > 0 ? result[0].totalCount[0].count : 0

            const totalPages = Math.ceil(totalBooks / limit)



            logger.info({
                requestId: requestId,
                pageNumber: pageNumber,
                totalBooks: totalBooks,
                totalPages: totalPages,
                hasNextPage: pageNumber < totalPages,
                hasPreviousPage: pageNumber > 1,
                limit,
                operation: "get_all_books",
                duration: performance.now() - startTime
            },
                "Books returned"
            )

            const duration = performance.now() - startTime
            if (duration > 3000) {
                logger.warn({
                    requestId: requestId,
                    currentPage: pageNumber,
                    totalBooks,
                    totalPages,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    limit,
                    operation: "get_all_books",
                    duration: `${duration.toFixed(2)}ms`
                },
                    `Get all books service taking ${duration} ms to respond`)
            }
            return {
                books: books,
                pagination: {
                    currentPage: pageNumber,
                    totalBooks,
                    totalPages,
                    hasNextPage: pageNumber < totalPages,
                    hasPreviousPage: pageNumber > 1,
                    limit
                }
            }
        } catch (error) {
            logger.error({
                requestId: requestId,
                pageNumber: pageNumber,
                error: error,
                operation: "get_all_books"
            },
                "Failed to get the requested page number"
            )
            if (error instanceof Error) {
                throw error
            }
            throw new Error("Unable to get books")
        }
    }


    async deleteBook(userId: string, bookId: string, requestId?: string) {
        try {
            const startTime = performance.now()
            logger.info(
                {
                    requestId: requestId,
                    userId: userId,
                    bookId: bookId,
                    operation: "delete_book"
                },
                "Delete book service started"
            )
            const deletedBook = await Book.findOneAndDelete({
                _id: bookId,
                author: userId


            })
            if (deletedBook) {
                await cloudinaryService.deleteAsset(deletedBook.coverImage)
                await cloudinaryService.deleteAsset(deletedBook.file)
            }

            logger.info({
                requestId: requestId,
                userId: userId,
                bookId: bookId,
                operation: "delete_book",
                duration: performance.now() - startTime
            },
                "Book deleted"
            )

            const duration = performance.now() - startTime
            if (duration > 3000) {
                logger.warn({
                    requestId: requestId,
                    operation: "delete_book",
                    duration: `${duration.toFixed(2)}ms`
                }, `Delete book service taking ${duration} ms to respond`)
            }
            return deletedBook
        } catch (error) {
            logger.error({
                requestId: requestId,
                userId: userId,
                bookId: bookId,
                error: error,
                operation: "delete_book"
            },
                "Failed to delete the book"
            )
            if (error instanceof Error) {
                throw error
            }
            throw new Error("Unable to delete the book")
        }
    }


    async updateBook(
        bookId: string,
        authorId: string,
        updateArgs?: UpdateBookDTO,
        coverImageMimeType?: string,
        coverImageFileName?: string,
        coverImageFilePath?: string,
        bookFileMimeType?: string,
        bookFileName?: string,
        bookFilePath?: string,
        requestId?: string

    ) {
        try {
            const startTime = performance.now()
            logger.info(
                {
                    requestId: requestId,
                    userId: authorId,
                    bookId: bookId,
                    operation: "update_book"
                },
                "Update book service started"
            )
            let newCoverImageUrl;
            let newBookUrl;
            const currentBook = await this.findBook(bookId)
            if (currentBook === null) {
                logger.warn(
                    {
                        requestId: requestId,
                        userId: authorId,
                        bookId: bookId,
                        operation: "update_book"
                    },
                    "Failed to find book with requested book id"
                )
                throw new Error(`Unable to find book with id ${bookId}`)
            }
            if (authorId != String(currentBook.author)) {

                logger.warn(
                    {
                        requestId: requestId,
                        userId: authorId,
                        bookId: bookId,
                        operation: "update_book"
                    },
                    "Cannot update book from different authors"
                )
                throw new Error("Cannot update book from different authors")
            }
            if (coverImageFileName && coverImageFilePath && coverImageMimeType) {
                const coverImageUrl = currentBook.coverImage

                newCoverImageUrl = await cloudinaryService.uploadBookCover(
                    coverImageMimeType,
                    coverImageFileName,
                    coverImageFilePath,
                )
                if (newCoverImageUrl) {
                    await cloudinaryService.deleteAsset(coverImageUrl)
                }
            }

            if (bookFileMimeType && bookFileName && bookFilePath) {
                const bookUrl = currentBook.file

                newBookUrl = await cloudinaryService.uploadBookPdf(
                    bookFileMimeType,
                    bookFileName,
                    bookFilePath
                )
                if (newBookUrl) {
                    await cloudinaryService.deleteAsset(bookUrl)
                }
            }
            const updatedTitle = updateArgs?.title ? updateArgs?.title : currentBook.title
            const updatedGenre = updateArgs?.genre ? updateArgs?.genre : currentBook.genre
            // Update the bookinfo in db
            const updatedBook = await Book.findByIdAndUpdate(
                bookId,
                {
                    title: updatedTitle,
                    genre: updatedGenre,
                    coverImage: newCoverImageUrl ? newCoverImageUrl : currentBook.coverImage,
                    file: newBookUrl ? newBookUrl : currentBook.file
                },
                { new: true })
            logger.info({
                requestId: requestId,
                userId: authorId,
                bookId: bookId,
                operation: "update_book",
                duration: performance.now() - startTime
            },
                "Book updated"
            )

            const duration = performance.now() - startTime
            if (duration > 3000) {
                logger.warn({
                    requestId: requestId,
                    operation: "update_book",
                    duration: `${duration.toFixed(2)}ms`
                }, `Update book service taking ${duration} ms to respond`)
            }
            return updatedBook
        }
        catch (error) {
            logger.error({
                requestId: requestId,
                userId: authorId,
                bookId: bookId,
                error: error,
                operation: "update_book"
            },
                "Failed to update the book"
            )
            if (error instanceof Error) {
                throw error
            }
            throw new Error("Unable to update the book")
        }
    }
}

export const bookService = new BookService()