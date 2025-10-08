
import type { NextFunction, Request, Response } from "express";
import { activeConnections, httpDuration, httpRequests } from "../utils/metrics.js";

let connectionCount = 0

export const promMetrics = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const startTime = Date.now()
    connectionCount++
    activeConnections.set(connectionCount)
    res.on('close', () => {
        const duration = (Date.now() - startTime) / 1000
        const route = req.path
        httpRequests.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        })

        httpDuration.observe({
            method: req.method,
            route: route
        }, duration)

        connectionCount--
        activeConnections.set(connectionCount)
    })

    next()

}