import type { Response, Request } from "express"
import { register } from "prom-client";
const getMetric = async (
    req: Request,
    res: Response,
) => {
    try {
        res.set('Content-Type', register.contentType)
        const metrics = await register.metrics();
        res.end(metrics)
    } catch (error) {
        res.status(500).end(error)
    }
}

export { getMetric }