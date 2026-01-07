# Frontend Architecture - Quick Reference

**Last Updated:** 2026-01-07  
**Status:** ✅ Clean & Consistent

---

## 📁 Directory Structure

```
frontend/src/
├── assets/              # Static assets (images, fonts)
├── components/          # Reusable UI components
│   ├── BookCard.tsx     # Book display card
│   ├── ErrorBoundary.tsx
│   ├── FileUpload.tsx
│   ├── Modal.tsx
│   ├── Navbar.tsx       # Main navigation
│   ├── Pagination.tsx
│   ├── ProtectedRoute.tsx
│   ├── Toast.tsx
│   ├── index.ts         # Component exports
│   └── layout/          # Layout components
│       ├── Footer.tsx
│       ├── Layout.tsx
│       └── Navbar.tsx   # Alternative navbar (for layout)
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication state
│   ├── AuthContextDef.ts
│   ├── ThemeContext.tsx # Theme management
│   └── useAuth.ts
├── hooks/               # Custom React hooks
│   ├── useBooks.ts      # Book data fetching
│   ├── useRateLimiter.ts
│   ├── useToast.ts
│   └── index.ts
├── pages/               # Route/Page components
│   ├── BookDetailPage.tsx
│   ├── BooksPage.tsx
│   ├── EditBookPage.tsx
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── MyBooksPage.tsx
│   ├── NotFoundPage.tsx
│   ├── RegisterPage.tsx
│   ├── UploadPage.tsx
│   └── index.ts
├── services/            # API & External services
│   └── api.ts           # Main API service (fetch-based)
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   ├── date.ts
│   ├── proxyUrl.ts
│   ├── token.ts
│   ├── validation.ts
│   └── index.ts
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

---

## 🎯 Import Patterns

### ✅ Correct Pattern (Use This)

```typescript
// Relative imports from same directory
import { BookCard } from './BookCard';

// Relative imports from parent directory
import { useAuth } from '../context/AuthContext';

// Relative imports from nested directories
import { useAuth } from '../../context/AuthContext';

// Named exports from index files
import { BookCard, Navbar, Toast } from '../components';
import { useBooks, useToast } from '../hooks';
```

### ❌ Incorrect Pattern (Don't Use)

```typescript
// NO path aliases (not configured)
import { useAuth } from '@/context/AuthContext';  // ❌
import { BookCard } from '@/components';          // ❌
import api from '@/lib/api';                      // ❌
```

---

## 🔌 API Service

### Location
`/src/services/api.ts`

### Usage

```typescript
import { authApi, booksApi } from '../services/api';

// Authentication
const response = await authApi.login({ email, password });
const response = await authApi.register({ name, email, password });

// Books
const books = await booksApi.getAll(page, authorId);
const book = await booksApi.getById(bookId);
const created = await booksApi.create(formData);
const updated = await booksApi.update(bookId, formData);
await booksApi.delete(bookId);
```

### Features
- ✅ Fetch-based (no external dependencies)
- ✅ Automatic token management
- ✅ Request timeout (30s)
- ✅ Error handling
- ✅ Type-safe responses

---

## 🎨 Context Providers

### AuthContext

**Location:** `/src/context/AuthContext.tsx`

**Usage:**
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { 
    isAuthenticated, 
    isLoading, 
    userId, 
    login, 
    register, 
    logout,
    error,
    clearError 
  } = useAuth();
  
  // Use auth state and methods
}
```

### ThemeContext

**Location:** `/src/context/ThemeContext.tsx`

**Usage:**
```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // theme: 'light' | 'dark'
}
```

---

## 🪝 Custom Hooks

### useBooks

**Location:** `/src/hooks/useBooks.ts`

**Usage:**
```typescript
import { useBooks } from '../hooks';

function BooksPage() {
  const { books, pagination, isLoading, error, refetch } = useBooks({
    page: 1,
    autoFetch: true,
    authorId: 'optional-author-id'
  });
}
```

### useBook (Single Book)

```typescript
import { useBook } from '../hooks/useBooks';

function BookDetailPage() {
  const { book, isLoading, error, refetch } = useBook({
    bookId: '123',
    autoFetch: true
  });
}
```

### useToast

**Location:** `/src/hooks/useToast.ts`

**Usage:**
```typescript
import { useToast } from '../hooks';

function MyComponent() {
  const { showToast } = useToast();
  
  showToast('Success!', 'success');
  showToast('Error occurred', 'error');
  showToast('Warning', 'warning');
}
```

---

## 📦 Component Exports

### Main Components

**Location:** `/src/components/index.ts`

**Exported:**
- `Navbar` - Main navigation bar
- `BookCard` - Book display card
- `BookCardSkeleton` - Loading skeleton
- `Toast` - Toast notifications
- `Modal` - Modal dialogs
- `Pagination` - Pagination component
- `FileUpload` - File upload with drag-drop
- `ProtectedRoute` - Auth-protected routes
- `ErrorBoundary` - Error boundary wrapper

**Usage:**
```typescript
import { 
  Navbar, 
  BookCard, 
  Toast, 
  Modal 
} from '../components';
```

### Layout Components

**Location:** `/src/components/layout/`

**Available:**
- `Layout` - Main layout wrapper
- `Footer` - Footer component
- `Navbar` - Alternative navbar

---

## 🎭 TypeScript Types

**Location:** `/src/types/index.ts`

**Available Types:**
```typescript
// User types
User
AuthResponse
RegisterData
LoginData

// Book types
Book
BookGenre
Pagination
BooksResponse
BookResponse
CreateBookResponse

// Error types
ApiError
```

**Usage:**
```typescript
import type { Book, User, ApiError } from '../types';
```

---

## 🛠️ Utilities

**Location:** `/src/utils/`

### Available Utilities

```typescript
// Date utilities
import { formatDate, formatRelativeTime } from '../utils/date';

// URL proxying
import { getProxiedCoverUrl, getProxiedFileUrl } from '../utils/proxyUrl';

// Token management
import { isTokenExpired, getUserIdFromToken } from '../utils/token';

// Validation
import { 
  sanitizeInput, 
  sanitizeErrorMessage,
  validateEmail,
  validatePassword 
} from '../utils/validation';
```

---

## 🚀 Development

### Start Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

---

## ✅ Best Practices

### 1. Component Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for all components

### 2. Import Organization
```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// 3. Local imports (types first)
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookCard } from '../components';
```

### 3. Error Handling
```typescript
try {
  const response = await booksApi.getAll();
  // Handle success
} catch (err) {
  const apiError = err as ApiError;
  console.error(apiError.message);
  // Handle error
}
```

### 4. Protected Routes
```typescript
<Route
  path="/upload"
  element={
    <ProtectedRoute>
      <UploadPage />
    </ProtectedRoute>
  }
/>
```

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `App.tsx` | Main app component with routing |
| `main.tsx` | Application entry point |
| `index.css` | Global styles and design system |
| `services/api.ts` | API service layer |
| `context/AuthContext.tsx` | Authentication state |
| `hooks/useBooks.ts` | Book data fetching |

---

## 🔍 Finding Components

### Need a component?

1. Check `/src/components/index.ts` for exports
2. Look in `/src/components/` for specific files
3. Check `/src/components/layout/` for layout-specific components

### Need a hook?

1. Check `/src/hooks/index.ts` for exports
2. Look in `/src/hooks/` for specific files

### Need a type?

1. Check `/src/types/index.ts` - all types are there

### Need a utility?

1. Check `/src/utils/index.ts` for exports
2. Look in `/src/utils/` for specific utilities

---

## 🎯 Common Tasks

### Add a new page
1. Create file in `/src/pages/MyPage.tsx`
2. Export from `/src/pages/index.ts`
3. Add route in `App.tsx`

### Add a new component
1. Create file in `/src/components/MyComponent.tsx`
2. Export from `/src/components/index.ts`
3. Import where needed

### Add a new hook
1. Create file in `/src/hooks/useMyHook.ts`
2. Export from `/src/hooks/index.ts`
3. Import where needed

### Add a new API endpoint
1. Add method to `authApi` or `booksApi` in `/src/services/api.ts`
2. Add types to `/src/types/index.ts` if needed

---

**Quick Tip:** Use your IDE's "Go to Definition" (F12) to navigate the codebase efficiently!
