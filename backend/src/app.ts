
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
import type { Request, Response } from 'express'


const app = express()

// CORS configuration - allow frontend origins
const corsOptions = {
    origin: [
        'http://localhost:5173',    // Vite dev server
        'http://127.0.0.1:5173',
        'http://localhost:3000',    // Alternative React dev server
        'http://127.0.0.1:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(promMetrics)
app.use(httpLogger)

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