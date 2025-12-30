import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/useAuth';

export function HomePage() {
  const { isAuthenticated } = useAuth();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const features = [
    {
      icon: BookOpen,
      title: 'Vast Collection',
      description: 'Access thousands of books across various genres and topics.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Share your writings and discover works from fellow authors.',
    },
    {
      icon: Sparkles,
      title: 'Premium Experience',
      description: 'Enjoy a seamless reading experience with beautiful design.',
    },
    {
      icon: TrendingUp,
      title: 'Always Growing',
      description: 'New books added daily by our vibrant community of writers.',
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero container">
        <div className="hero-bg" />
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={itemVariants} className="hero-title">
            Discover Your Next
            <br />
            <span className="text-gradient">Favorite Book</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="hero-description">
            Explore a world of stories, knowledge, and imagination. Join our community
            of readers and writers to share, discover, and celebrate the written word.
          </motion.p>

          <motion.div variants={itemVariants} className="hero-actions">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/books" className="btn btn-primary btn-lg">
                Browse Library
                <ArrowRight size={20} />
              </Link>
            </motion.div>
            {!isAuthenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn btn-outline btn-lg">
                  Create Account
                </Link>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10K+</div>
              <div className="hero-stat-label">Books Available</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">5K+</div>
              <div className="hero-stat-label">Active Readers</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">12</div>
              <div className="hero-stat-label">Genres</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="section container">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}
        >
          <h2 style={{ marginBottom: 'var(--space-4)' }}>
            Why Choose <span className="text-gradient">E-Library</span>?
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto' }}>
            We provide the best platform for book lovers to discover, read, and share their favorite stories.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <div className="card-body" style={{ textAlign: 'center' }}>
                <motion.div
                  style={{
                    width: '4rem',
                    height: '4rem',
                    margin: '0 auto var(--space-4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-600))',
                    borderRadius: 'var(--radius-xl)',
                  }}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <feature.icon size={28} color="white" />
                </motion.div>
                <h4 style={{ marginBottom: 'var(--space-3)' }}>{feature.title}</h4>
                <p style={{ marginBottom: 0, fontSize: 'var(--text-sm)' }}>{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <motion.div
          className="container"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(244, 63, 94, 0.1))',
              textAlign: 'center',
              padding: 'var(--space-16) var(--space-8)',
            }}
          >
            <h2 style={{ marginBottom: 'var(--space-4)' }}>
              Ready to Start Your Journey?
            </h2>
            <p style={{ maxWidth: '500px', margin: '0 auto var(--space-8)' }}>
              Join thousands of readers and writers in our ever-growing community.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to={isAuthenticated ? '/books' : '/register'} className="btn btn-primary btn-lg">
                {isAuthenticated ? 'Explore Books' : 'Get Started Free'}
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border-subtle)', padding: 'var(--space-8) 0' }}>
        <div className="container flex justify-between items-center" style={{ flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '2rem',
                height: '2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <BookOpen size={16} color="white" />
            </div>
            <span style={{ fontWeight: 600 }}>E-Library</span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} E-Library. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
