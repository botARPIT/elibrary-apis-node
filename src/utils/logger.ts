
import type { Request, Response } from 'express'
import { randomUUID } from 'node:crypto'
import pino from 'pino'
import { pinoHttp } from 'pino-http'


const isDev = process.env.NODE_ENV !== "production"
export const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    ...(isDev && {
        transport: {

            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname"
            }
        }
    })

})


//middleware for logging incoming http request
export const httpLogger = pinoHttp({
    logger,
    genReqId: function (req: Request, res: Response) {
        return req.headers["x-request-id"]?.toString() || randomUUID()
    },
    serializers: {
        req(req: Request) {
            return {
                requestId: req.id,
                method: req.method,
                url: req.url,
            }
        },
        res(res: Response) {
            return {
                statuscode: res.statusCode
            }
        }
    },

})