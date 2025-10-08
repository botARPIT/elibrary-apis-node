import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express'
import globalErrorHandler from './middlewares/globalErrorHandler.js'
import userRouter from './user/userRouter.js'
import { bookRouter } from './book/bookRouter.js'

import { swaggerUi, specs, generateSpecFiles } from './swagger.js'
import { httpLogger } from './utils/logger.js'
import { promMetrics } from './middlewares/promethuesMetrics.js'
import { register } from 'prom-client'


const app = express()
app.use(express.json())
app.use(promMetrics)
app.use(httpLogger)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: 'swagger-ui .topbar {display: none}',
    customSiteTitle: "E-library API Docs"
}))

app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(specs)
})

app.get('/', (req: Request, res: Response) => {

    res.json({ message: "Server started" })
})

app.get('/health', (req: Request, res: Response) => {

    res.json({ message: "I'm up" })
})

app.get('/metrics', async (req: Request, res: Response) => {
    try {
        res.set('Content-Type', register.contentType)
        const metrics = await register.metrics();
        res.end(metrics)
    } catch (error) {
        res.status(500).end('Error generating metrics')
    }
})

app.use('/api/users', userRouter)
app.use("/api/books", bookRouter)
app.use(globalErrorHandler)
// generateSpecFiles().then(() => {
//     console.log("Specfile generated")
// })
export default app 