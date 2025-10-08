import { config as conf } from 'dotenv'
// Convention to denote if a variable is private
conf()
const _config = {
    port: process.env.PORT,
    databaseUrl: process.env.MONGO_DATABASE_URL,
    env: process.env.NODE_ENV,
    jwt_secret: process.env.JWT_SECRET,
    max_file_size: 70 * 1024 * 1024, //70 MB,
    cloudinary_cloud: String(process.env.CLOUDINARY_CLOUD),
    cloudinary_api_key: String(process.env.CLOUDINARY_API_KEY),
    cloudinary_api_secret: String(process.env.CLOUDINARY_API_SECRET),
    file_upload_directory: "../../public/data/uploads"


}
if (!_config.databaseUrl) { throw new Error("Unable to get database Url") }
export const config = Object.freeze(_config) //Makes the file readonly