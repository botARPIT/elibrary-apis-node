import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, LogIn, LogOut, Moon, Plus, Sun, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/ThemeContext';
import { UserAvatar } from './UserAvatar';

export function Navbar() {
  const { isAuthenticated, userName, userEmail, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close menu when route changes
  useEffect(() => {
    setTimeout(() => setIsMenuOpen(false), 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/books', label: 'Browse' },
    { path: '/my-books', label: 'My Books', requireAuth: true },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" aria-label="E-Library Home">
          <motion.div
            className="navbar-logo-icon"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <BookOpen size={20} aria-hidden="true" />
          </motion.div>
          <span className="text-gradient">E-Library</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-nav desktop-only" role="menubar">
          {navItems.map(
            (item) =>
              (!item.requireAuth || isAuthenticated) && (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`navbar-link ${isActive(item.path) ? 'active' : ''}`}
                  role="menuitem"
                  aria-current={isActive(item.path) ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
          )}
        </div>

        <div className="navbar-actions">
          <motion.button
            className="btn btn-icon btn-ghost"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <Moon size={20} aria-hidden="true" />
            ) : (
              <Sun size={20} aria-hidden="true" />
            )}
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-icon btn-ghost mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="desktop-actions desktop-only">
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/upload" className="btn btn-primary" aria-label="Upload a new book">
                    <Plus size={18} aria-hidden="true" />
                    <span>Upload</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <UserAvatar name={userName} email={userEmail} size="md" />
                </motion.div>
                <motion.button
                  className="btn btn-icon btn-ghost"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  aria-label="Log out of your account"
                  title="Logout"
                >
                  <LogOut size={20} aria-hidden="true" />
                </motion.button>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="btn btn-ghost" aria-label="Log in to your account">
                    <LogIn size={18} aria-hidden="true" />
                    <span>Login</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                    aria-label="Create a new account"
                  >
                    <User size={18} aria-hidden="true" />
                    <span>Sign Up</span>
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mobile-menu-container">
              {navItems.map(
                (item) =>
                  (!item.requireAuth || isAuthenticated) && (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  )
              )}

              <div className="mobile-menu-divider" />

              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="mobile-nav-link">
                    <Plus size={18} /> Upload Book
                  </Link>
                  <button onClick={handleLogout} className="mobile-nav-link text-error">
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link">
                    <LogIn size={18} /> Login
                  </Link>
                  <Link to="/register" className="mobile-nav-link">
                    <User size={18} /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
