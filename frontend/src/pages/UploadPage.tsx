import { useState, type FormEvent, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, BookOpen, Sparkles } from 'lucide-react';
import { FileUpload, Toast } from '../components';
import { booksApi } from '../services/api';
import { BookGenre, type ApiError } from '../types';
import { validateBookTitle, sanitizeErrorMessage } from '../utils/validation';
import { useRateLimiter } from '../hooks/useRateLimiter';

export function UploadPage() {
    const navigate = useNavigate();
    const { isLimited, checkRateLimit } = useRateLimiter(5000); // 5 second cooldown

    const [formData, setFormData] = useState({
        title: '',
        genre: '' as BookGenre | '',
    });
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateForm = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        // Title validation using utility
        const titleError = validateBookTitle(formData.title);
        if (titleError) {
            newErrors.title = titleError;
        }

        if (!formData.genre) {
            newErrors.genre = 'Please select a genre';
        }

        if (!coverImage) {
            newErrors.coverImage = 'Please upload a cover image';
        }

        if (!bookFile) {
            newErrors.bookFile = 'Please upload a PDF file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, coverImage, bookFile]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Rate limit check
        if (!checkRateLimit()) {
            setToast({ message: 'Please wait before uploading again', type: 'error' });
            return;
        }

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const form = new FormData();
            form.append('title', formData.title.trim());
            form.append('genre', formData.genre);
            form.append('coverImage', coverImage!);
            form.append('file', bookFile!);

            await booksApi.create(form);
            
            setToast({ message: 'Book uploaded successfully!', type: 'success' });
            setTimeout(() => navigate('/books'), 2000);
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
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate on blur
        if (name === 'title') {
            const error = validateBookTitle(formData.title);
            if (error) {
                setErrors(prev => ({ ...prev, title: error }));
            }
        }
    };

    return (
        <main className="container section" role="main" aria-label="Upload a book">
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
                            background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))',
                            borderRadius: 'var(--radius-xl)',
                        }}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        aria-hidden="true"
                    >
                        <Upload size={24} color="white" />
                    </motion.div>
                    <div>
                        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-1)' }}>
                            Upload a Book
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                            Share your work with the community
                        </p>
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
                                    <BookOpen size={16} style={{ display: 'inline', marginRight: 'var(--space-2)' }} aria-hidden="true" />
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
                                    <p id="title-error" className="form-error" role="alert">{errors.title}</p>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="genre" className="form-label">
                                    <Sparkles size={16} style={{ display: 'inline', marginRight: 'var(--space-2)' }} aria-hidden="true" />
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
                                    <p id="genre-error" className="form-error" role="alert">{errors.genre}</p>
                                )}
                            </div>

                            <FileUpload
                                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                                label="Cover Image"
                                onChange={(file) => {
                                    setCoverImage(file);
                                    if (file && errors.coverImage) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.coverImage;
                                            return newErrors;
                                        });
                                    }
                                }}
                                value={coverImage}
                                icon="image"
                                maxSize={10}
                            />
                            {errors.coverImage && (
                                <p className="form-error" role="alert" style={{ marginTop: '-var(--space-4)' }}>
                                    {errors.coverImage}
                                </p>
                            )}

                            <FileUpload
                                accept=".pdf,application/pdf"
                                label="Book File (PDF)"
                                onChange={(file) => {
                                    setBookFile(file);
                                    if (file && errors.bookFile) {
                                        setErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.bookFile;
                                            return newErrors;
                                        });
                                    }
                                }}
                                value={bookFile}
                                icon="file"
                                maxSize={70}
                            />
                            {errors.bookFile && (
                                <p className="form-error" role="alert" style={{ marginTop: '-var(--space-4)' }}>
                                    {errors.bookFile}
                                </p>
                            )}

                            <motion.button
                                type="submit"
                                className="btn btn-primary btn-lg w-full"
                                disabled={isSubmitting || isLimited}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ marginTop: 'var(--space-6)' }}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
                                        <span>Uploading...</span>
                                    </>
                                ) : isLimited ? (
                                    'Please wait...'
                                ) : (
                                    <>
                                        <Upload size={20} aria-hidden="true" />
                                        Upload Book
                                    </>
                                )}
                            </motion.button>
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
