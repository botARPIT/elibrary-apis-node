
import path from 'node:path'
import { config } from '../config/config.js'
export function getDirectoryName() {
    return path.resolve(config.file_upload_directory)

}