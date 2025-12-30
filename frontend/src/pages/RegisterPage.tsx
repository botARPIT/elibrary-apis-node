import { useState, type FormEvent, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff, User, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { 
    validateEmail, 
    validateName, 
    validatePassword, 
    getPasswordStrengthLabel, 
    getPasswordStrengthColor 
} from '../utils/validation';
import { useRateLimiter } from '../hooks/useRateLimiter';

export function RegisterPage() {
    const navigate = useNavigate();
    const { register, isLoading, error, clearError } = useAuth();
    const { isLimited, checkRateLimit } = useRateLimiter(3000); // 3 second cooldown

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    const validateForm = useCallback((): boolean => {
        const errors: Record<string, string> = {};

        // Name validation
        const nameError = validateName(formData.name);
        if (nameError) {
            errors.name = nameError;
        }

        // Email validation
        const emailError = validateEmail(formData.email);
        if (emailError) {
            errors.email = emailError;
        }

        // Password validation (now with strength requirements)
        const passwordResult = validatePassword(formData.password);
        if (!passwordResult.isValid) {
            errors.password = passwordResult.errors[0]; // Show first error
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        // Rate limit check
        if (!checkRateLimit()) {
            return;
        }

        if (!validateForm()) return;

        try {
            await register({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
            });
            navigate('/books');
        } catch {
            // Error is handled by context
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear validation error for this field when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        if (error) clearError();
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        
        // Validate on blur
        let fieldError: string | null = null;
        if (name === 'name') {
            fieldError = validateName(formData.name);
        } else if (name === 'email') {
            fieldError = validateEmail(formData.email);
        } else if (name === 'password') {
            const result = validatePassword(formData.password);
            fieldError = result.isValid ? null : result.errors[0];
        } else if (name === 'confirmPassword') {
            fieldError = formData.password !== formData.confirmPassword 
                ? 'Passwords do not match' 
                : null;
        }
        
        if (fieldError) {
            setValidationErrors(prev => ({ ...prev, [name]: fieldError }));
        }
    };

    const passwordResult = validatePassword(formData.password);
    const strengthLabel = getPasswordStrengthLabel(passwordResult.strength);
    const strengthColor = getPasswordStrengthColor(passwordResult.strength);

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
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Join our community of readers and writers</p>
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
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User
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
                                id="name"
                                name="name"
                                type="text"
                                placeholder="Enter your name"
                                className={`form-input ${validationErrors.name && touched.name ? 'error' : ''}`}
                                value={formData.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                autoComplete="name"
                                aria-invalid={!!validationErrors.name}
                                aria-describedby={validationErrors.name ? 'name-error' : undefined}
                                style={{ paddingLeft: 'var(--space-16)' }}
                            />
                        </div>
                        {validationErrors.name && touched.name && (
                            <p id="name-error" className="form-error" role="alert">{validationErrors.name}</p>
                        )}
                    </div>

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
                                placeholder="Create a strong password"
                                className={`form-input ${validationErrors.password && touched.password ? 'error' : ''}`}
                                value={formData.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                autoComplete="new-password"
                                aria-invalid={!!validationErrors.password}
                                aria-describedby="password-requirements"
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
                            <p className="form-error" role="alert">{validationErrors.password}</p>
                        )}
                        
                        {/* Password Strength Indicator */}
                        {formData.password && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{ marginTop: 'var(--space-2)' }}
                            >
                                <div 
                                    style={{ display: 'flex', gap: 'var(--space-1)', marginBottom: 'var(--space-1)' }}
                                    role="progressbar"
                                    aria-valuenow={passwordResult.strength}
                                    aria-valuemin={0}
                                    aria-valuemax={4}
                                    aria-label={`Password strength: ${strengthLabel}`}
                                >
                                    {[0, 1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            style={{
                                                flex: 1,
                                                height: '4px',
                                                borderRadius: '2px',
                                                background: i < passwordResult.strength
                                                    ? strengthColor
                                                    : 'var(--color-border)',
                                                transition: 'background 0.2s',
                                            }}
                                        />
                                    ))}
                                </div>
                                <span id="password-requirements" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                                    Password strength: {strengthLabel}
                                    {passwordResult.strength < 3 && ' (min: 8 chars, uppercase, lowercase, number)'}
                                </span>
                            </motion.div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
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
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                className={`form-input ${validationErrors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                required
                                autoComplete="new-password"
                                aria-invalid={!!validationErrors.confirmPassword}
                                aria-describedby={validationErrors.confirmPassword ? 'confirm-error' : undefined}
                                style={{ paddingLeft: 'var(--space-16)', paddingRight: 'var(--space-12)' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
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
                                {showConfirmPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                            </button>
                        </div>
                        {validationErrors.confirmPassword && touched.confirmPassword && (
                            <p id="confirm-error" className="form-error" role="alert">{validationErrors.confirmPassword}</p>
                        )}
                        {formData.confirmPassword && formData.password === formData.confirmPassword && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{ 
                                    fontSize: 'var(--text-sm)', 
                                    color: 'var(--color-success-500)', 
                                    marginTop: 'var(--space-1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-1)'
                                }}
                            >
                                <Check size={14} aria-hidden="true" /> Passwords match
                            </motion.p>
                        )}
                    </div>

                    <motion.button
                        type="submit"
                        className="btn btn-primary w-full btn-lg"
                        disabled={isLoading || isLimited}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ marginTop: 'var(--space-4)' }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner" style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden="true" />
                                <span>Creating Account...</span>
                            </>
                        ) : isLimited ? (
                            'Please wait...'
                        ) : (
                            'Create Account'
                        )}
                    </motion.button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Sign in</Link>
                </div>
            </motion.div>
        </div>
    );
}
