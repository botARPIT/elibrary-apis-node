import type { NextFunction, Request, Response } from "express";
import { getFileUploadPath } from "../book/multerFileUpload.js";

const fileUploadMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const fileUploadField = getFileUploadPath()
    fileUploadField.fields([
        { name: 'coverImage', maxCount: 1 },
        { name: 'file', maxCount: 1 }
    ])(req, res, next)
}

export { fileUploadMiddleware }