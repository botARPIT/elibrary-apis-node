import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Book } from '../types';
import { getProxiedCoverUrl } from '../utils/proxyUrl';

interface BookCardProps {
  book: Book;
  index?: number;
}

export function BookCard({ book, index = 0 }: BookCardProps) {
  const authorName = typeof book.author === 'object' ? book.author.name : 'Unknown Author';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="book-card card"
    >
      {/* Main Link Overlay - Ensures the whole card is clickable */}
      <Link
        to={`/books/${book._id}`}
        className="book-card-link-overlay"
        aria-label={`View ${book.title} by ${authorName}`}
      />

      <img
        src={getProxiedCoverUrl(book.coverImage, book._id)}
        alt={book.title}
        className="book-card-image"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop';
        }}
      />

      <div className="book-card-gradient" />

      <div className="book-card-content">
        <span className="book-card-genre">{book.genre}</span>
        <h3 className="book-card-title line-clamp-2">{book.title}</h3>
        <div className="book-card-meta">
          <span>by {authorName}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="book-card skeleton" style={{ aspectRatio: '3/4' }}>
      <div
        style={{ padding: 'var(--space-6)', position: 'absolute', bottom: 0, left: 0, right: 0 }}
      >
        <div
          className="skeleton"
          style={{ height: '1rem', width: '30%', marginBottom: 'var(--space-2)' }}
        />
        <div
          className="skeleton"
          style={{ height: '1.5rem', width: '80%', marginBottom: 'var(--space-2)' }}
        />
        <div className="skeleton" style={{ height: '1rem', width: '50%' }} />
      </div>
    </div>
  );
}
