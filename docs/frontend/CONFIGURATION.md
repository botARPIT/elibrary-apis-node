# Configuration Management - Production Best Practices

**Status:** ✅ Complete  
**Date:** 2026-01-07

---

## Overview

The frontend now uses a production-ready configuration management system with:
- Centralized configuration in `src/config/index.ts`
- Application constants in `src/constants/index.ts`
- Environment variable management via `.env` files
- Type-safe configuration access
- Runtime validation

---

## File Structure

```
frontend/
├── .env                      # Local development (gitignored)
├── .env.example              # Template with all available options
├── src/
│   ├── config/
│   │   └── index.ts          # Centralized configuration
│   ├── constants/
│   │   └── index.ts          # Application constants
│   ├── services/
│   │   └── api.ts            # Updated to use config
│   └── main.tsx              # Config validation on startup
```

---

## Configuration (`src/config/index.ts`)

### Features

✅ **Type-Safe Access** - All configuration values are typed  
✅ **Environment Variables** - Reads from `import.meta.env`  
✅ **Default Values** - Sensible defaults for development  
✅ **Validation** - Runtime validation on startup  
✅ **Helper Functions** - Type-safe getters for env vars

### Usage

```typescript
import config from '@/config';

// API configuration
const apiUrl = config.api.baseUrl;        // string
const timeout = config.api.timeout;       // number

// Feature flags
const debugMode = config.features.debug;   // boolean

// Auth settings
const tokenKey = config.auth.tokenKey;     // string

// Environment info
const isDev = config.env.isDev;            // boolean
```

### Configuration Sections

#### 1. App Metadata
```typescript
config.app.name          // Application name
config.app.version       // Version number
config.app.description   // Description
```

#### 2. API Configuration
```typescript
config.api.baseUrl       // Backend API URL
config.api.timeout       // Request timeout (ms)
config.api.retry         // Retry configuration
```

#### 3. Authentication
```typescript
config.auth.tokenKey                // Storage key for token
config.auth.tokenCheckInterval      // Token validation interval
config.auth.tokenExpirationBuffer   // Expiration buffer (sec)
```

#### 4. Feature Flags
```typescript
config.features.analytics      // Enable analytics
config.features.serviceWorker  // Enable offline support
config.features.debug          // Debug mode
```

#### 5. Logging
```typescript
config.logging.level     // Log level (debug|info|warn|error)
config.logging.enabled   // Enable logging
```

#### 6. Upload Settings
```typescript
config.upload.maxFileSize         // Max book file size
config.upload.maxCoverSize        // Max cover image size
config.upload.acceptedBookTypes   // Accepted MIME types
config.upload.acceptedImageTypes  // Accepted image types
```

---

## Constants (`src/constants/index.ts`)

### Features

✅ **Immutable Values** - All constants are `as const`  
✅ **Type Guards** - Runtime type checking functions  
✅ **Organized** - Grouped by functionality  
✅ **Well-Documented** - JSDoc comments

### Available Constants

#### API Endpoints
```typescript
import { API_ENDPOINTS } from '@/constants';

API_ENDPOINTS.AUTH.LOGIN              // '/auth/login'
API_ENDPOINTS.BOOKS.LIST              // '/books'
API_ENDPOINTS.BOOKS.GET('123')        // '/books/123'
```

#### HTTP Status Codes
```typescript
import { HTTP_STATUS } from '@/constants';

HTTP_STATUS.OK                 // 200
HTTP_STATUS.UNAUTHORIZED       // 401
HTTP_STATUS.NOT_FOUND          // 404
```

#### Routes
```typescript
import { ROUTES } from '@/constants';

ROUTES.HOME                    // '/'
ROUTES.MY_BOOKS                // '/my-books'
ROUTES.BOOK_DETAIL('123')      // '/books/123'
```

#### Book Genres
```typescript
import { BOOK_GENRES, BOOK_GENRE_OPTIONS } from '@/constants';

BOOK_GENRES.FICTION            // 'Fiction'
BOOK_GENRE_OPTIONS             // Array of all genres
```

#### Upload Constants
```typescript
import { UPLOAD } from '@/constants';

UPLOAD.MAX_BOOK_FILE_SIZE      // 10MB in bytes
UPLOAD.ACCEPTED_BOOK_TYPES     // ['application/pdf']
```

#### Validation Rules
```typescript
import { VALIDATION } from '@/constants';

VALIDATION.EMAIL_REGEX         // Email regex pattern
VALIDATION.PASSWORD.MIN_LENGTH // 8
```

#### UI Constants
```typescript
import { THEMES, ANIMATION, DEBOUNCE } from '@/constants';

THEMES.DARK                    // 'dark'
ANIMATION.FAST                 // 150ms
DEBOUNCE.SEARCH                // 300ms
```

#### Error Messages
```typescript
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/constants';

ERROR_MESSAGES.NETWORK_ERROR   // 'Network error...'
SUCCESS_MESSAGES.LOGIN_SUCCESS // 'Login successful!'
```

---

## Environment Variables

### Available Variables

All environment variables must be prefixed with `VITE_` to be exposed to the frontend.

#### Required Variables

None are strictly required in development (sensible defaults are provided).

#### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `VITE_API_URL` | string | `/api` | Backend API base URL |
| `VITE_APP_NAME` | string | `E-Library` | Application name |
| `VITE_APP_VERSION` | string | `1.0.0` | Version number |
| `VITE_API_TIMEOUT` | number | `30000` | Request timeout (ms) |
| `VITE_LOG_LEVEL` | string | `debug` | Log level |
| `VITE_ENABLE_ANALYTICS` | boolean | `false` | Enable analytics |
| `VITE_ENABLE_DEBUG` | boolean | `auto` | Debug mode |
| `VITE_MAX_FILE_SIZE` | number | `10485760` | Max file size (bytes) |

See `.env.example` for the complete list.

---

## Setup Instructions

### 1. Local Development

```bash
# Copy the example file
cp .env.example .env

# Edit with your values (optional - defaults work for development)
nano .env
```

### 2. Production Deployment

```bash
# Set environment variables in your deployment platform
# For example, on Vercel, Netlify, or your CI/CD:

VITE_API_URL=https://api.elibrary.com
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true
VITE_LOG_LEVEL=warn
```

### 3. Environment-Specific Files

You can create environment-specific files:

```bash
.env                # Local development (gitignored)
.env.local          # Local overrides (gitignored)
.env.development    # Development environment
.env.production     # Production environment
.env.staging        # Staging environment
```

Vite automatically loads these based on the `--mode` flag:

```bash
# Uses .env.development
npm run dev

# Uses .env.production
npm run build

# Uses .env.staging
vite build --mode staging
```

---

## Migration Guide

### Before (Hardcoded Values)

```typescript
// ❌ Old way - hardcoded in api.ts
const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN_KEY = 'elibrary_access_token';
const REQUEST_TIMEOUT = 30000;
```

### After (Centralized Config)

```typescript
// ✅ New way - centralized config
import config from '@/config';

const API_BASE_URL = config.api.baseUrl;
const TOKEN_KEY = config.auth.tokenKey;
const REQUEST_TIMEOUT = config.api.timeout;
```

### Files Updated

1. **`src/services/api.ts`** - Now uses `config.api.*` and `config.auth.*`
2. **`src/main.tsx`** - Now calls `validateConfig()` on startup
3. **`.env.example`** - Updated with all available options
4. **`.env`** - Created for local development

---

## Best Practices

### DO ✅

- **Use config for runtime values** that might change per environment
- **Use constants for fixed values** that never change
- **Validate configuration** on app startup
- **Document new env vars** in `.env.example`
- **Use type-safe getters** from config module
- **Set production values** via deployment platform

### DON'T ❌

- **Don't commit `.env`** to version control
- **Don't hardcode** API URLs or keys in components
- **Don't use `import.meta.env` directly** - use config module
- **Don't skip the `VITE_` prefix** for new variables
- **Don't expose secrets** in frontend env vars (they're visible!)

---

## Security Considerations

⚠️ **Important:** All `VITE_*` environment variables are **bundled into the client-side code** and are **publicly visible**.

### Safe to Include:
- ✅ API URLs (public endpoints)
- ✅ Feature flags
- ✅ App metadata
- ✅ Public analytics IDs

### Never Include:
- ❌ API keys (backend only)
- ❌ Secrets or passwords
- ❌ Private tokens
- ❌ Database credentials

### For Sensitive Configuration:
- Use backend environment variables only
- Pass sensitive data through authenticated API calls
- Use backend proxies for third-party services

---

## Validation

The configuration is automatically validated on app startup:

```typescript
// In main.tsx
validateConfig();
```

This checks:
- ✅ Required values are present
- ✅ Timeout values are positive
- ✅ Retry counts are non-negative
- ✅ Logs configuration in development

If validation fails, the app throws an error with details.

---

## Type Safety

### Environment Variable Helpers

```typescript
import { env } from '@/config';

// Get string (with default)
const apiUrl = env.get('VITE_API_URL', '/api');

// Get required string (throws if missing)
const requiredVar = env.getRequired('VITE_REQUIRED_VAR');

// Get boolean
const debugMode = env.getBoolean('VITE_ENABLE_DEBUG', false);

// Get number
const timeout = env.getNumber('VITE_API_TIMEOUT', 30000);
```

### Configuration Types

All configuration is typed:

```typescript
// config.api.baseUrl is string
// config.api.timeout is number
// config.features.debug is boolean
// config.logging.level is 'debug' | 'info' | 'warn' | 'error'
```

---

## Testing

### Unit Tests

```typescript
import config from '@/config';

describe('Configuration', () => {
  it('should have valid API URL', () => {
    expect(config.api.baseUrl).toBeDefined();
  });

  it('should validate successfully', () => {
    expect(() => validateConfig()).not.toThrow();
  });
});
```

### Integration Tests

```typescript
import { render } from '@testing-library/react';
import App from './App';

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_URL: 'http://test-api.com',
    DEV: true,
  },
}));

test('app uses correct API URL', () => {
  // Test that API calls use mocked URL
});
```

---

## Troubleshooting

### Issue: Environment variables not working

**Symptoms:** Changes to `.env` not reflected in app

**Solution:**
1. Restart Vite dev server (`Ctrl+C` then `npm run dev`)
2. Ensure variable name starts with `VITE_`
3. Clear browser cache
4. Check `.env` file is in project root

### Issue: Config validation fails

**Symptoms:** App throws error on startup

**Solution:**
1. Check console for validation error details
2. Ensure all required values are set
3. Verify `.env` file format (no quotes needed)
4. Check for typos in variable names

### Issue: Different values in production

**Symptoms:** Production uses wrong config values

**Solution:**
1. Set environment variables in deployment platform
2. Don't rely on `.env` file in production
3. Use platform-specific env var settings
4. Rebuild app after changing env vars

---

## Summary

✅ **Centralized Configuration** - All settings in one place  
✅ **Type-Safe** - Full TypeScript support  
✅ **Environment-Aware** - Different values per environment  
✅ **Validated** - Runtime validation on startup  
✅ **Well-Documented** - Comprehensive comments and docs  
✅ **Production-Ready** - Follows best practices

The configuration system is now production-ready and follows industry best practices! 🎉

---

**Created:**2026-01-07  
**Status:** ✅ Complete  
**Maintained by:** Development Team
