import { memo } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Heart } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

function FooterComponent() {
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer
      className={`border-t transition-colors duration-300 bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800 ${
        theme === 'dark' ? 'dark:bg-gray-900 dark:border-gray-800' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gradient">E-Library</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Discover your next favorite book in our digital library.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/books"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500"
                >
                  Browse Books
                </Link>
              </li>
              <li>
                <Link
                  to="/upload"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500"
                >
                  Upload Book
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-500"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className="font-semibold mb-4">Popular Genres</h3>
            <ul className="space-y-2 text-sm">
              {['Fiction', 'Fantasy', 'Thriller', 'Romance'].map((genre) => (
                <li key={genre}>
                  <Link
                    to={`/books?genre=${genre}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-primary-500"
                  >
                    {genre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {year} E-Library. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-500"
            >
              <Github className="h-5 w-5" />
            </a>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);
