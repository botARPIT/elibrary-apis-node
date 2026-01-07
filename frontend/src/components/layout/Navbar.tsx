import { useState, memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X, Sun, Moon, LogOut, Upload, User, Search, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

function NavbarComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  const cycleTheme = () => {
    // Simple toggle between light and dark
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg border-b transition-colors duration-300 bg-white/80 border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gradient">E-Library</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full w-56 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm transition-all"
              />
            </form>

            <Link to="/" className="btn-ghost text-sm">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link to="/books" className="btn-ghost text-sm">
              <BookOpen className="h-4 w-4" />
              Browse
            </Link>

            <button
              onClick={cycleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={`Theme: ${theme}`}
            >
              <ThemeIcon className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/upload" className="btn-primary text-sm">
                  <Upload className="h-4 w-4" />
                  Upload
                </Link>
                <button onClick={logout} className="btn-ghost text-sm">
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">
                  <User className="h-4 w-4" />
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm"
              />
            </form>

            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>
            <Link
              to="/books"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <BookOpen className="h-5 w-5" />
              Browse
            </Link>

            <div className="flex gap-2 px-4">
              <span className="text-sm text-gray-500">Theme:</span>
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded-lg capitalize text-sm ${theme === 'light' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded-lg capitalize text-sm ${theme === 'dark' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                dark
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/upload"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500 text-white"
                  >
                    <Upload className="h-5 w-5" />
                    Upload
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl w-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <User className="h-5 w-5" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-500 text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export const Navbar = memo(NavbarComponent);
