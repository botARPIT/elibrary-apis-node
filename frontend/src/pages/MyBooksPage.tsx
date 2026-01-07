import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen, Search, BookX, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookCard, BookCardSkeleton, Pagination } from '../components';
import { useBooks } from '../hooks';
import { useAuth } from '../context/useAuth';
import { useDebounce } from '../hooks/useRateLimiter';

export function MyBooksPage() {
  const { userId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch ONLY the user's books
  const { books, pagination, isLoading, error, refetch } = useBooks({
    page: currentPage,
    autoFetch: true,
    authorId: userId || undefined,
  });

  const debouncedSearch = useDebounce((value: string) => {
    setSearchQuery(value);
  }, 300);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      refetch(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [refetch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  // Client-side filtering for search on the already fetched "my books"
  const filteredBooks = books.filter((book) => {
    return searchQuery === '' || book.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-surface border-b border-border-subtle">
        <div className="container py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="p-2 rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <BookOpen size={24} />
                </span>
                <span className="text-sm font-medium text-text-muted uppercase tracking-wider">
                  Personal Collection
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4">
                My Library
              </h1>
              <p className="text-lg text-text-secondary max-w-2xl">
                Manage your contributions and track your reading journey.
              </p>

              {/* Stats Row */}
              <div className="hero-stats">
                <div className="hero-stat" style={{ textAlign: 'left' }}>
                  <div className="hero-stat-value">{pagination?.totalBooks || 0}</div>
                  <div className="hero-stat-label">Total Books</div>
                </div>
                <div className="hero-stat" style={{ textAlign: 'left' }}>
                  <div className="hero-stat-value">{new Date().getFullYear()}</div>
                  <div className="hero-stat-label">Active Since</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/upload" className="btn btn-primary btn-lg shadow-lg shadow-primary-500/20">
                <Plus size={20} />
                <span>Upload New Book</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="container section py-12">
        {/* Search & Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="w-full sm:max-w-md relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search your collection..."
              className="form-input pl-12"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="empty-state bg-surface rounded-2xl border border-border p-12">
            <BookX size={48} className="text-error-500 mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">Failed to load library</h3>
            <p className="text-text-muted mb-6">{error}</p>
            <button onClick={() => refetch()} className="btn btn-outline">
              Try Again
            </button>
          </div>
        ) : filteredBooks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="empty-state bg-surface rounded-3xl border border-dashed border-border-subtle p-16"
          >
            <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-primary-900/10 flex items-center justify-center mb-6 text-primary-500">
              <Upload size={32} />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">
              {searchQuery ? 'No matches found' : 'Your library is empty'}
            </h3>
            <p className="text-text-muted max-w-md mx-auto mb-8 text-lg">
              {searchQuery
                ? `We couldn't find any books matching "${searchQuery}"`
                : 'Share your favorite stories with the world. Upload your first book to get started.'}
            </p>
            <Link to="/upload" className="btn btn-primary btn-lg">
              {searchQuery ? 'Clear Search' : 'Upload First Book'}
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <BookCard book={book} index={index} />
                </motion.div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12">
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
