import type { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
const getHealth = (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log("test")
        res.status(200).json({ "message": "OK" })
    } catch (error) {
        return next(createHttpError(500, error as string))
    }
}

export { getHealth }