import { beforeAll } from 'vitest'

// Set up test environment variables before all tests
beforeAll(() => {
    process.env.NODE_ENV = 'test'
    process.env.MONGO_DATABASE_URL = process.env.MONGO_DATABASE_URL || 'mongodb://localhost:27017/elib-test'
    process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'
    process.env.CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD || 'test-cloud'
    process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'test-key'
    process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'test-secret'
    process.env.PORT = process.env.PORT || '3001'
})
