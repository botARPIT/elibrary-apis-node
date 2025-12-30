# E-Library Frontend

A modern, production-grade React frontend for the E-Library API, built with TypeScript, Vite, and Framer Motion.

## Features

- **Modern Design**: Dark theme with glassmorphism, gradient effects, and smooth animations
- **Responsive**: Fully responsive design that works on all device sizes
- **Production-Ready**: Optimized build with code splitting and minification
- **Secure**: Secure token storage with session/local storage options
- **Type-Safe**: Full TypeScript support for all components and API calls

## Pages

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home page with hero section and features | ❌ |
| `/books` | Browse all books with search and filter | ❌ |
| `/books/:bookId` | View book details | ❌ |
| `/login` | User login | ❌ |
| `/register` | User registration | ❌ |
| `/upload` | Upload a new book | ✅ |
| `/books/:bookId/edit` | Edit book details | ✅ |

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Framer Motion** - Animations
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5513/api` |

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── BookCard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── Modal.tsx
│   │   ├── Navbar.tsx
│   │   ├── Pagination.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── Toast.tsx
│   ├── context/        # React context providers
│   │   └── AuthContext.tsx
│   ├── hooks/          # Custom React hooks
│   │   ├── useBooks.ts
│   │   └── useToast.ts
│   ├── pages/          # Page components
│   │   ├── HomePage.tsx
│   │   ├── BooksPage.tsx
│   │   ├── BookDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── UploadPage.tsx
│   │   ├── EditBookPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/       # API services
│   │   └── api.ts
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── vite.config.ts
└── package.json
```

## Design System

The frontend uses a comprehensive CSS design system with:

### Colors
- **Primary**: Purple (#8b5cf6)
- **Secondary**: Rose (#f43f5e)
- **Accent**: Cyan (#06b6d4)

### Components
- Buttons (primary, secondary, outline, ghost)
- Cards with glassmorphism effect
- Form inputs with focus states
- File upload with drag-and-drop
- Modal dialogs
- Toast notifications
- Skeleton loading states

### Animations
- Page transitions
- Hover effects on cards and buttons
- Staggered list animations
- Loading spinners
- Gradient text animations

## Security Features

- **Secure Token Storage**: Uses sessionStorage by default (more secure) with option for localStorage
- **Protected Routes**: Automatic redirect to login for authenticated routes
- **Input Sanitization**: Forms validate and sanitize all user input
- **XSS Protection**: React's built-in XSS protections
- **CSP Ready**: Security meta tags in index.html

## API Integration

The frontend integrates with the E-Library API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/register` | POST | Register new user |
| `/api/users/login` | POST | Login user |
| `/api/books` | GET | Get paginated books |
| `/api/books` | POST | Create new book |
| `/api/books/id/:bookId` | GET | Get book by ID |
| `/api/books/update/:bookId` | PATCH | Update book |
| `/api/books/:bookId` | DELETE | Delete book |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
