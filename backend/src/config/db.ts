import mongoose from "mongoose";
import { config } from "./config.js";
import { logger } from "../utils/logger.js";

const connectDB = async () => {

    try {
        //Add listeners before connecting to db in nodejs

        //Used to check if the database is connected initially
        mongoose.connection.on('connected', () => {
            logger.info("Connected to Database successfully")
        })

        //Used to throw errors if occured after connecting to database
        mongoose.connection.on('error', (err) => {
            logger.error({ err }, "Error connecting to database")
        })

        await mongoose.connect(config.database_url as string, { maxPoolSize: 10 })


    } catch (error) {
        console.error("Unable to connect to database", error)

        //Used to stop the server, if any error occured while connecting to database or after connecting to it
        process.exit(1)
    }
}


export default connectDB    