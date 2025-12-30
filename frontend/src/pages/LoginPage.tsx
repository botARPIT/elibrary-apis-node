import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { validateEmail } from '../utils/validation';
import { useRateLimiter } from '../hooks/useRateLimiter';

export function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, error, clearError } = useAuth();
    const { isLimited, checkRateLimit } = useRateLimiter(2000); // 2 second cooldown

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const from = (location.state as { from?: Location })?.from?.pathname || '/';

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        const emailError = validateEmail(formData.email);
        if (emailError) {
            errors.email = emailError;
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        
        // Rate limit check
        if (!checkRateLimit()) {
            return;
        }

        if (!validateForm()) return;

        try {
            await login({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            }, rememberMe);
            navigate(from, { replace: true });
        } catch {
            // Error is handled by context
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        
        // Clear validation error for this field
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[e.target.name];
                return newErrors;
            });
        }
        if (error) clearError();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate email on blur
        if (name === 'email') {
            const emailError = validateEmail(formData.email);
            if (emailError) {
                setValidationErrors(prev => ({ ...prev, email: emailError }));
            }
        }
    };

    return (
        <div className="auth-page">
            <motion.div
                className="auth-card"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            >
                <div className="auth-header">
                    <motion.div
                        className="auth-logo"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <BookOpen size={32} aria-hidden="true" />
                    </motion.div>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to continue to E-Library</p>
                </div>

                {error && (
                    <motion.div
                        role="alert"
                        aria-live="assertive"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)',
                            padding: 'var(--space-3) var(--space-4)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid var(--color-error-500)',
                            borderRadius: 'var(--radius-lg)',
                            marginBottom: 'var(--space-6)',
                        }}
                    >
                        <AlertCircle size={18} style={{ color: 'var(--color-error-500)' }} aria-hidden="true" />
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-error-500)' }}>
                            {error}
                        </span>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <div style={{ position: 'relative' }}>
                            <Mail
                                size={18}
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    left: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)',
                                }}
                            />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Enter your email"
                                className={`form-input ${validationErrors.email && touched.email ? 'error' : ''}`}
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                autoComplete="email"
                                aria-invalid={!!validationErrors.email}
                                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                                style={{ paddingLeft: 'var(--space-16)' }}
                            />
                        </div>
                        {validationErrors.email && touched.email && (
                            <p id="email-error" className="form-error" role="alert">{validationErrors.email}</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock
                                size={18}
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    left: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)',
                                }}
                            />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                className={`form-input ${validationErrors.password && touched.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                autoComplete="current-password"
                                aria-invalid={!!validationErrors.password}
                                aria-describedby={validationErrors.password ? 'password-error' : undefined}
                                style={{ paddingLeft: 'var(--space-16)', paddingRight: 'var(--space-12)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                style={{
                                    position: 'absolute',
                                    right: 'var(--space-4)',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                }}
                            >
                                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            </button>
                        </div>
                        {validationErrors.password && touched.password && (
                            <p id="password-error" className="form-error" role="alert">{validationErrors.password}</p>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            style={{ accentColor: 'var(--color-primary-500)' }}
                        />
                        <label 
                            htmlFor="remember" 
                            style={{ 
                                fontSize: 'var(--text-sm)', 
                                color: 'var(--color-text-secondary)', 
                                cursor: 'pointer' 
                            }}
                        >
                            Remember me
                        </label>
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={isLoading || isLimited}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
                                <span>Signing in...</span>
                            </>
                        ) : isLimited ? (
                            'Please wait...'
                        ) : (
                            'Sign In'
                        )}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register">Create one</Link>
                </div>
            </motion.div>
        </div>
    );
}
