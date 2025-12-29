import type { Response, Request, NextFunction } from "express"
import { register } from "prom-client";
const getMetric = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        res.set('Content-Type', register.contentType)
        const metrics = await register.metrics();
        res.end(metrics)
    } catch (error) {
        res.status(500).end('Error generating metrics')
    }
}

export { getMetric }