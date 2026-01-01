import app from "./app.js";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import { initializeRedis } from "./config/redis.js";
import { logger } from "./utils/logger.js";


const startServer = async () => {
    try {
        await connectDB()
        await initializeRedis()
        const port = config.port
        const server = app.listen(port, '127.0.0.1', () => {
            logger.info(`Server running on port ${port}`)
        })

        const shutdown = (signal: string) => {
            logger.info({ signal }, "Shutting down server")
            server.close(() => process.exit(0))
        }

        process.on("SIGTERM", shutdown)
        process.on("SIGINT", shutdown)
    } catch (error) {
        logger.error({ error }, "Failed to start server")
        process.exit(1)
    }
}

startServer()

