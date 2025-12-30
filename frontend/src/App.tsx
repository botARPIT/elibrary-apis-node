import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, ProtectedRoute } from './components';
import {
    HomePage,
    BooksPage,
    BookDetailPage,
    LoginPage,
    RegisterPage,
    UploadPage,
    EditBookPage,
    NotFoundPage,
    MyBooksPage,
} from './pages';

// Lazy load less frequently used pages for code splitting
// Note: For full code splitting, use React.lazy() with Suspense

import { ThemeProvider } from './context/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    {/* Skip to main content link for accessibility */}
                    <a 
                        href="#main-content" 
                        className="skip-link"
                        style={{
                            position: 'absolute',
                            left: '-9999px',
                            top: 'auto',
                            width: '1px',
                            height: '1px',
                            overflow: 'hidden',
                        }}
                    >
                        Skip to main content
                    </a>
                    
                    <Navbar />
                    
                    <div id="main-content">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/books" element={<BooksPage />} />
                            <Route path="/books/:bookId" element={<BookDetailPage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Protected Routes */}
                            <Route
                                path="/upload"
                                element={
                                    <ProtectedRoute>
                                        <UploadPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/books/:bookId/edit"
                                element={
                                    <ProtectedRoute>
                                        <EditBookPage />
                                    </ProtectedRoute>
                                }
                            />
                            
                            {/* My Books route */}
                            <Route
                                path="/my-books"
                                element={
                                    <ProtectedRoute>
                                        <MyBooksPage />
                                    </ProtectedRoute>
                                }
                            />

                            {/* 404 */}
                            <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                    </div>
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
