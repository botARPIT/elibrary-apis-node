
import path from 'node:path'
import { config } from '../config/config'
export function getDirectoryName() {
    return path.resolve(config.file_upload_directory)

}