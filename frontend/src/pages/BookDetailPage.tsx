import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  Edit,
  Trash2,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { booksApi } from '../services/api';
import { useAuth } from '../context/useAuth';
import { Modal, Toast } from '../components';
import { formatDate } from '../utils/date';
import { sanitizeErrorMessage, isValidImageUrl, isValidUrl } from '../utils/validation';
import { getProxiedCoverUrl, getProxiedFileUrl } from '../utils/proxyUrl';
import type { Book, ApiError } from '../types';

// Default fallback image for broken covers
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';

export function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadBook = useCallback(async () => {
    if (!bookId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await booksApi.getById(bookId);
      setBook(response.data.book);
    } catch (err) {
      const apiError = err as ApiError;
      setError(sanitizeErrorMessage(new Error(apiError.message)));
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const handleDelete = async () => {
    if (!bookId) {
      return;
    }

    setIsDeleting(true);
    try {
      await booksApi.delete(bookId);
      setToast({ message: 'Book deleted successfully', type: 'success' });
      setTimeout(() => navigate('/books'), 1500);
    } catch (err) {
      const apiError = err as ApiError;
      setToast({ message: sanitizeErrorMessage(new Error(apiError.message)), type: 'error' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Handle image errors with fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    if (target.src !== FALLBACK_IMAGE) {
      target.src = FALLBACK_IMAGE;
    }
  };

  // Get sanitized and proxied cover image URL
  const getCoverImage = (url: string): string => {
    if (isValidImageUrl(url) && bookId) {
      return getProxiedCoverUrl(url, bookId);
    }
    return FALLBACK_IMAGE;
  };

  /**
   * SECURITY NOTE: This isAuthor check is for UX purposes only (hiding buttons).
   * The backend MUST verify ownership on all edit/delete operations.
   * Never trust this client-side check for actual authorization.
   */
  const isAuthor =
    isAuthenticated &&
    book &&
    (typeof book.author === 'object' ? book.author._id === userId : book.author === userId);

  const authorName = book && typeof book.author === 'object' ? book.author.name : 'Unknown Author';

  const authorInitial = authorName.charAt(0).toUpperCase();

  // Loading State
  if (isLoading) {
    return (
      <main className="container section" aria-busy="true" aria-label="Loading book details">
        <div className="book-detail">
          <div
            className="skeleton"
            style={{ aspectRatio: '3/4', borderRadius: 'var(--radius-2xl)' }}
          />
          <div>
            <div
              className="skeleton"
              style={{ height: '1.5rem', width: '100px', marginBottom: 'var(--space-4)' }}
            />
            <div
              className="skeleton"
              style={{ height: '3rem', width: '80%', marginBottom: 'var(--space-4)' }}
            />
            <div
              className="skeleton"
              style={{ height: '1.5rem', width: '200px', marginBottom: 'var(--space-6)' }}
            />
            <div className="skeleton" style={{ height: '100px', width: '100%' }} />
          </div>
        </div>
      </main>
    );
  }

  // Error State
  if (error) {
    return (
      <main className="container section">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="empty-state"
          role="alert"
        >
          <AlertCircle className="empty-state-icon" aria-hidden="true" />
          <h3 className="empty-state-title">Error Loading Book</h3>
          <p className="empty-state-description">{error}</p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button onClick={loadBook} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/books" className="btn btn-outline">
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Books
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <main className="container section">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <Link to="/books" className="btn btn-ghost" aria-label="Go back to books list">
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Books
        </Link>
      </motion.div>

      <article className="book-detail" itemScope itemType="https://schema.org/Book">
        {/* Cover Image */}
        <motion.div
          className="book-detail-cover"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <img
            src={getCoverImage(book.coverImage)}
            alt={`Cover of ${book.title}`}
            onError={handleImageError}
            itemProp="image"
            loading="eager"
          />
        </motion.div>

        {/* Content */}
        <motion.div
          className="book-detail-content"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="badge badge-primary book-detail-genre" itemProp="genre">
            {book.genre}
          </span>

          <h1 className="book-detail-title" itemProp="name">
            {book.title}
          </h1>

          <div
            className="book-detail-author"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="book-detail-author-avatar" aria-hidden="true">
              {authorInitial}
            </div>
            <span>
              by <span itemProp="name">{authorName}</span>
            </span>
          </div>

          <div className="book-detail-meta">
            <div className="book-detail-meta-item">
              <span className="book-detail-meta-label">
                <Calendar
                  size={14}
                  style={{ display: 'inline', marginRight: '4px' }}
                  aria-hidden="true"
                />
                Published
              </span>
              <span className="book-detail-meta-value" itemProp="datePublished">
                {formatDate(book.createdAt)}
              </span>
            </div>
            <div className="book-detail-meta-item">
              <span className="book-detail-meta-label">
                <Clock
                  size={14}
                  style={{ display: 'inline', marginRight: '4px' }}
                  aria-hidden="true"
                />
                Updated
              </span>
              <span className="book-detail-meta-value" itemProp="dateModified">
                {formatDate(book.updatedAt)}
              </span>
            </div>
          </div>

          <div className="book-detail-actions">
            <motion.a
              href={isValidUrl(book.file) ? getProxiedFileUrl(book.file, bookId) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-primary btn-lg ${!isValidUrl(book.file) ? 'disabled' : ''}`}
              whileHover={isValidUrl(book.file) ? { scale: 1.05 } : {}}
              whileTap={isValidUrl(book.file) ? { scale: 0.95 } : {}}
              aria-label={`Download ${book.title} as PDF`}
              aria-disabled={!isValidUrl(book.file)}
              onClick={(e) => !isValidUrl(book.file) && e.preventDefault()}
            >
              <Download size={20} aria-hidden="true" />
              Download PDF
            </motion.a>

            <motion.a
              href={isValidUrl(book.file) ? getProxiedFileUrl(book.file, bookId) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`btn btn-outline btn-lg ${!isValidUrl(book.file) ? 'disabled' : ''}`}
              whileHover={isValidUrl(book.file) ? { scale: 1.05 } : {}}
              whileTap={isValidUrl(book.file) ? { scale: 0.95 } : {}}
              aria-label={`Read ${book.title} online`}
              aria-disabled={!isValidUrl(book.file)}
              onClick={(e) => !isValidUrl(book.file) && e.preventDefault()}
            >
              <BookOpen size={20} aria-hidden="true" />
              Read Online
            </motion.a>

            {isAuthor && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to={`/books/${bookId}/edit`}
                    className="btn btn-outline btn-lg"
                    aria-label={`Edit ${book.title}`}
                  >
                    <Edit size={18} aria-hidden="true" />
                    Edit
                  </Link>
                </motion.div>
                <motion.button
                  className="btn btn-outline btn-lg"
                  style={{ borderColor: 'var(--color-error-500)', color: 'var(--color-error-500)' }}
                  onClick={() => setShowDeleteModal(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={`Delete ${book.title}`}
                >
                  <Trash2 size={18} aria-hidden="true" />
                  Delete
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </article>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Book"
        footer={
          <>
            <button
              className="btn btn-ghost"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleDelete}
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span
                    className="spinner"
                    style={{ width: '1rem', height: '1rem' }}
                    aria-hidden="true"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} aria-hidden="true" />
                  Delete Book
                </>
              )}
            </button>
          </>
        }
      >
        <p style={{ margin: 0 }}>
          Are you sure you want to delete "{book.title}"? This action cannot be undone.
        </p>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
