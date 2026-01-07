// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  id?: string;
  accessToken: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Book Types - Using const object instead of enum for erasableSyntaxOnly compatibility
export const BookGenre = {
  MYTHOLOGICAL: 'Mythological',
  STORY: 'Story',
  NOVEL: 'Novel',
  FICTION: 'Fiction',
  SCIENCE_FICTION: 'Science Fiction',
  POEM: 'Poem',
  THRILLER: 'Thriller',
  FANTASY: 'Fantasy',
  NON_FICTION: 'Non Fiction',
  HORROR: 'Horror',
  ROMANCE: 'Romance',
  COMIC: 'Comic',
} as const;

export type BookGenre = (typeof BookGenre)[keyof typeof BookGenre];

export interface Book {
  _id: string;
  title: string;
  author: User | string;
  genre: BookGenre;
  coverImage: string;
  file: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalBooks: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

export interface BooksResponse {
  success: boolean;
  data: {
    books: Book[];
    pagination: Pagination;
  };
}

export interface BookResponse {
  success: boolean;
  data: {
    book: Book;
  };
}

export interface CreateBookResponse {
  success: boolean;
  data: {
    message: string;
    created_book_id: string;
    cover_url: string;
    book_url: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
}
