import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search } from 'lucide-react';

export function NotFoundPage() {
  return (
    <main
      className="container"
      style={{
        minHeight: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          style={{
            fontSize: 'clamp(8rem, 20vw, 12rem)',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            lineHeight: 1,
            marginBottom: 'var(--space-6)',
          }}
        >
          <span className="text-gradient">404</span>
        </motion.div>

        <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-4)' }}>
          Page Not Found
        </h1>

        <p
          style={{
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-8)',
            fontSize: 'var(--text-lg)',
          }}
        >
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex gap-4 justify-center" style={{ flexWrap: 'wrap' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="btn btn-primary btn-lg">
              <Home size={20} />
              Go Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/books" className="btn btn-outline btn-lg">
              <Search size={20} />
              Browse Books
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
