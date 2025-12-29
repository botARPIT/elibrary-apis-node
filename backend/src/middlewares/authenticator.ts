import type { NextFunction, Request, Response } from "express";
import { verifyJWT } from "../utils/jwt.js";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
    sub: Sub
}

type Sub = {
    id: string
}


export function authenticator(req: Request, res: Response, next: NextFunction) {

    try {

        const authString = req.headers.authorization as string
        if (!authString) return res.status(401).json({ message: "Unauthorized" })
        const [header, token] = authString.split(" ")
        if (!header || !token) return res.status(401).json({ message: "Invalid jwt token" })

        const payload: JwtPayload | string = verifyJWT(token!)
        const _req = req as AuthRequest
        _req.sub = payload.sub as unknown as Sub
        req.log = req.log.child({ userId: _req.sub.id, requestId: req.id })
        return next()
    } catch (error) {
        if (error instanceof Error) { }
        return res.status(401).json({ message: "Invalid jwt token" })
    }

}   