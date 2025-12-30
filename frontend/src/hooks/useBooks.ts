import { useState, useEffect, useCallback } from 'react';
import { booksApi } from '../services/api';
import type { Book, Pagination, ApiError } from '../types';

interface UseBooksOptions {
    page?: number;
    autoFetch?: boolean;
    authorId?: string;
}

interface UseBooksReturn {
    books: Book[];
    pagination: Pagination | null;
    isLoading: boolean;
    error: string | null;
    refetch: (page?: number) => Promise<void>;
}

export function useBooks(options: UseBooksOptions = {}): UseBooksReturn {
    const { page = 1, autoFetch = true, authorId } = options;

    const [books, setBooks] = useState<Book[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBooks = useCallback(async (pageNum: number = page) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await booksApi.getAll(pageNum, authorId);
            setBooks(response.data.books);
            setPagination(response.data.pagination);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load books');
        } finally {
            setIsLoading(false);
        }
    }, [page, authorId]);

    useEffect(() => {
        if (autoFetch) {
            fetchBooks();
        }
    }, [autoFetch, fetchBooks]);

    return {
        books,
        pagination,
        isLoading,
        error,
        refetch: fetchBooks,
    };
}

interface UseBookOptions {
    bookId: string | undefined;
    autoFetch?: boolean;
}

interface UseBookReturn {
    book: Book | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useBook(options: UseBookOptions): UseBookReturn {
    const { bookId, autoFetch = true } = options;

    const [book, setBook] = useState<Book | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBook = useCallback(async () => {
        if (!bookId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const response = await booksApi.getById(bookId);
            setBook(response.data.book);
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to load book');
        } finally {
            setIsLoading(false);
        }
    }, [bookId]);

    useEffect(() => {
        if (autoFetch && bookId) {
            fetchBook();
        }
    }, [autoFetch, bookId, fetchBook]);

    return {
        book,
        isLoading,
        error,
        refetch: fetchBook,
    };
}
