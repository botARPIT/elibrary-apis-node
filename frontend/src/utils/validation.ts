/**
 * Validation utilities for form inputs
 * Centralizes validation logic for security and consistency
 */

// Email validation with proper regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
}

export function validateEmail(email: string): string | null {
    if (!email.trim()) {
        return 'Email is required';
    }
    if (!isValidEmail(email)) {
        return 'Please enter a valid email address';
    }
    return null;
}

// Password validation with strength requirements
export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
    strength: number; // 0-4
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength = 0;

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters');
    } else {
        strength++;
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    } else {
        strength++;
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    } else {
        strength++;
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    } else {
        strength++;
    }

    // Check for common passwords (basic list - in production, use a proper library)
    const commonPasswords = ['password', '12345678', 'qwertyui', 'letmein1'];
    if (commonPasswords.some(cp => password.toLowerCase().includes(cp))) {
        errors.push('Password is too common');
        strength = Math.max(0, strength - 2);
    }

    return {
        isValid: errors.length === 0,
        errors,
        strength,
    };
}

export function getPasswordStrengthLabel(strength: number): string {
    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return labels[Math.min(strength, 4)];
}

export function getPasswordStrengthColor(strength: number): string {
    const colors = [
        'var(--color-error-500)',
        'var(--color-error-500)',
        'var(--color-warning-500)',
        'var(--color-primary-500)',
        'var(--color-success-500)',
    ];
    return colors[Math.min(strength, 4)];
}

// Name validation
export function validateName(name: string): string | null {
    const trimmed = name.trim();
    if (!trimmed) {
        return 'Name is required';
    }
    if (trimmed.length < 2) {
        return 'Name must be at least 2 characters';
    }
    if (trimmed.length > 50) {
        return 'Name must be less than 50 characters';
    }
    // Only allow letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
        return 'Name contains invalid characters';
    }
    return null;
}

// Book title validation
export function validateBookTitle(title: string): string | null {
    const trimmed = title.trim();
    if (!trimmed) {
        return 'Title is required';
    }
    if (trimmed.length < 2) {
        return 'Title must be at least 2 characters';
    }
    if (trimmed.length > 100) {
        return 'Title must be less than 100 characters';
    }
    return null;
}

// URL validation (for sanitizing image URLs)
export function isValidImageUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        // Only allow HTTPS URLs (or localhost for development)
        if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') {
            return false;
        }

        // Strict domain checking
        const allowedDomains = [
            'res.cloudinary.com',
            'images.unsplash.com',
            'localhost',
        ];

        const isAllowedDomain = allowedDomains.some(domain =>
            parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
        );

        const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(parsed.pathname);

        // Allow if it's from a trusted domain OR has a valid image extension (but still valid protocol)
        return isAllowedDomain || hasImageExtension;
    } catch {
        return false;
    }
}

// Generic validation for external links (e.g. PDF downloads)
export function isValidUrl(url: string): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        // Only allow http/https
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

// Sanitize error messages for user display
export function sanitizeErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        // Don't expose internal error details
        const message = error.message.toLowerCase();
        if (message.includes('network') || message.includes('fetch')) {
            return 'Unable to connect to the server. Please check your internet connection.';
        }
        if (message.includes('unauthorized') || message.includes('401')) {
            return 'Your session has expired. Please log in again.';
        }
        if (message.includes('forbidden') || message.includes('403')) {
            return 'You do not have permission to perform this action.';
        }
        if (message.includes('not found') || message.includes('404')) {
            return 'The requested resource was not found.';
        }
        if (message.includes('server') || message.includes('500')) {
            return 'An internal server error occurred. Please try again later.';
        }
        // Return the message if it seems safe
        if (error.message.length < 200 && !error.message.includes('stack')) {
            return error.message;
        }
    }
    return 'An unexpected error occurred. Please try again.';
}
