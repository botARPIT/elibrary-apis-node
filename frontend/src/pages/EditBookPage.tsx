import { useState, useEffect, type FormEvent, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { FileUpload, Toast } from '../components';
import { booksApi } from '../services/api';
import { BookGenre, type Book, type ApiError } from '../types';
import { validateBookTitle, sanitizeErrorMessage, isValidImageUrl } from '../utils/validation';
import { useRateLimiter } from '../hooks/useRateLimiter';

export function EditBookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { isLimited, checkRateLimit } = useRateLimiter(3000); // 3 second cooldown

  const [book, setBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '' as BookGenre | '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) {
        return;
      }

      try {
        const response = await booksApi.getById(bookId);
        setBook(response.data.book);
        setFormData({
          title: response.data.book.title,
          genre: response.data.book.genre,
        });
      } catch (err) {
        const apiError = err as ApiError;
        const message = sanitizeErrorMessage(new Error(apiError.message));
        setToast({ message, type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    const titleError = validateBookTitle(formData.title);
    if (titleError) {
      newErrors.title = titleError;
    }

    if (!formData.genre) {
      newErrors.genre = 'Please select a genre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Rate limit check
    if (!checkRateLimit()) {
      setToast({ message: 'Please wait before saving again', type: 'error' });
      return;
    }

    if (!validateForm() || !bookId) {
      return;
    }

    setIsSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', formData.title.trim());
      form.append('genre', formData.genre);
      if (coverImage) {
        form.append('coverImage', coverImage);
      }
      if (bookFile) {
        form.append('file', bookFile);
      }

      await booksApi.update(bookId, form);

      setToast({ message: 'Book updated successfully!', type: 'success' });
      setTimeout(() => navigate(`/books/${bookId}`), 2000);
    } catch (err) {
      const apiError = err as ApiError;
      const message = sanitizeErrorMessage(new Error(apiError.message));
      setToast({ message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === 'title') {
      const error = validateBookTitle(formData.title);
      if (error) {
        setErrors((prev) => ({ ...prev, title: error }));
      }
    }
  };

  // Get safe URL for display
  const getSafeUrl = (url: string, label: string): React.ReactNode => {
    if (isValidImageUrl(url) || url.startsWith('http')) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: 'var(--color-primary-400)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {label}
          <ExternalLink size={12} aria-hidden="true" />
        </a>
      );
    }
    return <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>;
  };

  if (isLoading) {
    return (
      <main className="container section" aria-busy="true" aria-label="Loading book editor">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div
            className="skeleton"
            style={{ height: '3rem', width: '150px', marginBottom: 'var(--space-8)' }}
          />
          <div className="card">
            <div className="card-body">
              <div
                className="skeleton"
                style={{ height: '2rem', width: '200px', marginBottom: 'var(--space-6)' }}
              />
              <div
                className="skeleton"
                style={{ height: '3rem', width: '100%', marginBottom: 'var(--space-4)' }}
              />
              <div
                className="skeleton"
                style={{ height: '3rem', width: '100%', marginBottom: 'var(--space-4)' }}
              />
              <div
                className="skeleton"
                style={{ height: '8rem', width: '100%', marginBottom: 'var(--space-4)' }}
              />
              <div className="skeleton" style={{ height: '8rem', width: '100%' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!book) {
    return (
      <main className="container section">
        <div className="empty-state" role="alert">
          <h3 className="empty-state-title">Book Not Found</h3>
          <p className="empty-state-description">The book you're trying to edit doesn't exist.</p>
          <Link to="/books" className="btn btn-primary">
            Back to Books
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section" role="main" aria-label="Edit book">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{ marginBottom: 'var(--space-6)' }}
      >
        <Link
          to={`/books/${bookId}`}
          className="btn btn-ghost"
          aria-label="Go back to book details"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Back to Book
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ maxWidth: '700px', margin: '0 auto' }}
      >
        <div className="flex items-center gap-4 mb-8">
          <motion.div
            style={{
              width: '3.5rem',
              height: '3.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))',
              borderRadius: 'var(--radius-xl)',
            }}
            whileHover={{ rotate: 10 }}
            aria-hidden="true"
          >
            <Save size={24} color="white" />
          </motion.div>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-1)' }}>
              Edit Book
            </h1>
            <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>Update your book details</p>
          </div>
        </div>

        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="title" className="form-label">
                  <BookOpen
                    size={16}
                    style={{ display: 'inline', marginRight: 'var(--space-2)' }}
                    aria-hidden="true"
                  />
                  Book Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter the book title"
                  className={`form-input ${errors.title && touched.title ? 'error' : ''}`}
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                  maxLength={100}
                />
                {errors.title && touched.title && (
                  <p id="title-error" className="form-error" role="alert">
                    {errors.title}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="genre" className="form-label">
                  <Sparkles
                    size={16}
                    style={{ display: 'inline', marginRight: 'var(--space-2)' }}
                    aria-hidden="true"
                  />
                  Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  className={`form-select ${errors.genre && touched.genre ? 'error' : ''}`}
                  value={formData.genre}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.genre}
                  aria-describedby={errors.genre ? 'genre-error' : undefined}
                >
                  <option value="">Select a genre</option>
                  {Object.values(BookGenre).map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                {errors.genre && touched.genre && (
                  <p id="genre-error" className="form-error" role="alert">
                    {errors.genre}
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  Current cover: {getSafeUrl(book.coverImage, 'View Image')}
                </p>
              </div>

              <FileUpload
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                label="New Cover Image (Optional)"
                onChange={setCoverImage}
                value={coverImage}
                icon="image"
                maxSize={10}
              />

              <div
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-lg)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    margin: 0,
                  }}
                >
                  Current file: {getSafeUrl(book.file, 'View PDF')}
                </p>
              </div>

              <FileUpload
                accept=".pdf,application/pdf"
                label="New Book File (Optional)"
                onChange={setBookFile}
                value={bookFile}
                icon="file"
                maxSize={70}
              />

              <div className="flex gap-4" style={{ marginTop: 'var(--space-6)' }}>
                <Link
                  to={`/books/${bookId}`}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  aria-label="Cancel editing"
                >
                  Cancel
                </Link>
                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || isLimited}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ flex: 2 }}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner"
                        style={{ width: '1.25rem', height: '1.25rem' }}
                        aria-hidden="true"
                      />
                      <span>Saving...</span>
                    </>
                  ) : isLimited ? (
                    'Please wait...'
                  ) : (
                    <>
                      <Save size={20} aria-hidden="true" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>

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
