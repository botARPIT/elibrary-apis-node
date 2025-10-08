import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {

    try {
        //Add listeners before connecting to db in nodejs

        //Used to check if the database is connected initially
        mongoose.connection.on('connected', () => {
            console.log("Connected to database successfully")
        })

        //Used to throw errors if occured after connecting to database
        mongoose.connection.on('error', (err) => {
            console.log("Error connecting to database", err)
        })

        await mongoose.connect(config.databaseUrl as string)


    } catch (error) {
        console.error("Unable to connect to database", error)

        //Used to stop the server, if any error occured while connecting to database or after connecting to it
        process.exit(1)
    }
}


export default connectDB    