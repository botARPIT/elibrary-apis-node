import type {  Request, Response } from "express";
import type { HttpError } from "http-errors";
import { config } from "../config/config.js";

const globalErrorHandler =
    (
        err: HttpError,
        req: Request,
        res: Response,
    ) => {
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message,
            errorStack: config.env === "dev" ? err.stack : ""
        })
    }


export default globalErrorHandler