import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, BookX, RefreshCw } from 'lucide-react';
import { BookCard, BookCardSkeleton, Pagination } from '../components';
import { useBooks } from '../hooks';
import { BookGenre } from '../types';
import { useDebounce } from '../hooks/useRateLimiter';

export function BooksPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState<string>('');

    // Use the custom hook for data fetching
    const { books, pagination, isLoading, error, refetch } = useBooks({ 
        page: currentPage, 
        autoFetch: true 
    });

    // Debounce search to avoid excessive filtering
    const debouncedSearch = useDebounce((value: string) => {
        setSearchQuery(value);
    }, 300);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        refetch(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [refetch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSearch(e.target.value);
    };

    const handleRetry = useCallback(() => {
        refetch(currentPage);
    }, [refetch, currentPage]);

    // Client-side filtering (server-side would be preferred)
    const filteredBooks = books.filter((book) => {
        const matchesSearch = searchQuery === '' || 
            book.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGenre = selectedGenre === '' || book.genre === selectedGenre;
        return matchesSearch && matchesGenre;
    });

    return (
        <main className="container section" role="main" aria-label="Books Library">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--space-8)' }}
            >
                <h1 style={{ marginBottom: 'var(--space-2)' }}>
                    Browse <span className="text-gradient">Books</span>
                </h1>
                <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                    Discover your next favorite read from our collection
                </p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-4"
                style={{ marginBottom: 'var(--space-8)', flexWrap: 'wrap' }}
                role="search"
                aria-label="Filter books"
            >
                <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                    <Search 
                        size={20} 
                        aria-hidden="true"
                        style={{ 
                            position: 'absolute', 
                            left: 'var(--space-4)', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)' 
                        }} 
                    />
                    <input
                        type="search"
                        placeholder="Search books..."
                        className="form-input"
                        defaultValue={searchQuery}
                        onChange={handleSearchChange}
                        aria-label="Search books by title"
                        style={{ paddingLeft: 'var(--space-12)' }}
                    />
                </div>
                
                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Filter 
                        size={20} 
                        aria-hidden="true"
                        style={{ 
                            position: 'absolute', 
                            left: 'var(--space-4)', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: 'var(--color-text-muted)',
                            pointerEvents: 'none'
                        }} 
                    />
                    <select
                        className="form-select"
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        aria-label="Filter by genre"
                        style={{ paddingLeft: 'var(--space-12)' }}
                    >
                        <option value="">All Genres</option>
                        {Object.values(BookGenre).map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>
                </div>
            </motion.div>

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="empty-state"
                    role="alert"
                >
                    <BookX className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">Error Loading Books</h3>
                    <p className="empty-state-description">{error}</p>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleRetry}
                        aria-label="Retry loading books"
                    >
                        <RefreshCw size={18} aria-hidden="true" />
                        Try Again
                    </button>
                </motion.div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div 
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    aria-busy="true"
                    aria-label="Loading books"
                >
                    {Array.from({ length: 8 }).map((_, i) => (
                        <BookCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && filteredBooks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state"
                >
                    <BookX className="empty-state-icon" aria-hidden="true" />
                    <h3 className="empty-state-title">No Books Found</h3>
                    <p className="empty-state-description">
                        {searchQuery || selectedGenre
                            ? 'Try adjusting your search or filter'
                            : 'No books available at the moment'}
                    </p>
                    {(searchQuery || selectedGenre) && (
                        <button 
                            className="btn btn-outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedGenre('');
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
                </motion.div>
            )}

            {/* Books Grid */}
            {!isLoading && !error && filteredBooks.length > 0 && (
                <>
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        role="list"
                        aria-label={`${filteredBooks.length} books found`}
                    >
                        {filteredBooks.map((book, index) => (
                            <div role="listitem" key={book._id}>
                                <BookCard book={book} index={index} />
                            </div>
                        ))}
                    </motion.div>

                    {/* Pagination - only show when not filtering */}
                    {pagination && !searchQuery && !selectedGenre && (
                        <nav 
                            style={{ marginTop: 'var(--space-12)' }}
                            aria-label="Books pagination"
                        >
                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                        </nav>
                    )}
                </>
            )}
        </main>
    );
}
