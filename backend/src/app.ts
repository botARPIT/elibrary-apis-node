
import cors from 'cors'
import globalErrorHandler from './middlewares/globalErrorHandler.js'
import userRouter from './user/userRouter.js'
import { bookRouter } from './book/bookRouter.js'
import express from 'express'
import { swaggerUi, specs } from './swagger.js'
import { httpLogger } from './utils/logger.js'
import { promMetrics } from './middlewares/prometheusMetrics.js'
import { metricRouter } from "./observability/metricsRouter.js"
import { healthRouter } from './health/healthRouter.js'
import { apiLimiter } from './middlewares/rateLimiter.js'
import type { Request, Response } from 'express'


const app = express()

// CORS configuration - allow frontend origins
const corsOptions = {
    origin: [
        'http://localhost:5173',    // Vite dev server
        'http://localhost:3000',    // Alternative React dev server
        'https://elib.arpitdev.site' // Production frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
    preflightContinue: false,
    optionsSuccessStatus: 204
}

app.use(cors(corsOptions))

// Explicit preflight handler for all routes
app.options('*', cors(corsOptions))

app.use(express.json())
app.use(promMetrics)
app.use(httpLogger)

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: 'swagger-ui .topbar {display: none}',
    customSiteTitle: "E-library API Docs"
}))
app.use('/api/users', userRouter)
app.use("/api/books", bookRouter)
app.use(healthRouter)
app.get('/api-docs.json', (res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
})

app.get("/metrics", metricRouter)

// Middleware to handle unknown routes
app.use((req: Request, res: Response) => {
    res.status(404).json({ message: 'Not Found' })
})

app.use(globalErrorHandler)
export default app 