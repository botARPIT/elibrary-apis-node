import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express'
import cors from 'cors'
import globalErrorHandler from './middlewares/globalErrorHandler.js'
import userRouter from './user/userRouter.js'
import { bookRouter } from './book/bookRouter.js'

import { swaggerUi, specs, generateSpecFiles } from './swagger.js'
import { httpLogger } from './utils/logger.js'
import { promMetrics } from './middlewares/prometheusMetrics.js'
import { register } from 'prom-client'
import { healthRouter } from './health/healthRouter.js'


const app = express()

// CORS configuration - allow frontend origins
const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://localhost:3001'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(promMetrics)
app.use(httpLogger)
app.use(globalErrorHandler)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: 'swagger-ui .topbar {display: none}',
    customSiteTitle: "E-library API Docs"
}))
app.use('/api/users', userRouter)
app.use("/api/books", bookRouter)
app.use(healthRouter)
app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
})


app.get("/metrics", async (req: Request, res: Response) => {
    res.set("Content-Type", register.contentType)
    res.set(await register.metrics())
})
export default app 