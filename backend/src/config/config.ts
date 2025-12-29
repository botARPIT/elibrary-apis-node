import { config as dotenvConfig } from 'dotenv'
console.log('CWD:', process.cwd())

dotenvConfig()
const _config = {
    port: Number(process.env.PORT ?? 3001),
    database_url: process.env.MONGO_DATABASE_URL,
    redis_url: process.env.REDIS_URL,
    env: process.env.NODE_ENV ?? "development",
    jwt_secret: process.env.JWT_SECRET,
    serviceName: process.env.SERVICE_NAME ?? "elib",
    log_level: process.env.LOG_LEVEL ?? "info",
    max_file_size: Number(70 * 1024 * 1024), //70 MB,
    cloudinary: {
        cloud: process.env.CLOUDINARY_CLOUD,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    file_upload_directory: process.env.FILE_UPLOAD_DIRECTORY ?? "/app/data/uploads"


}
// Skip strict validation in test environment
const isTest = process.env.NODE_ENV === 'test'

if (!isTest) {
    if (!_config.database_url) { throw new Error("MONGO_DATABASE_URL is required") }
    if (!_config.jwt_secret) { throw new Error("JWT_SECRET is required") }
    if (!_config.cloudinary.cloud) { throw new Error("CLOUDINARY_CLOUD is required") }
    if (!_config.cloudinary.api_key) { throw new Error("CLOUDINARY_API_KEY is required") }
    if (!_config.cloudinary.api_secret) { throw new Error("CLOUDINARY_API_SECRET is required") }
    if (!_config.redis_url) { throw new Error("REDIS_URL is required") }
}

export const config = Object.freeze(_config) //Makes the file readonly