import app from "./app.js";
import { config } from "./config/config.js";
import connectDB from "./config/db.js";
import { logger } from "./utils/logger.js";


const startServer = async () => {
    await connectDB()
    const port = config.port || 3001
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`)
    })
}

startServer()

