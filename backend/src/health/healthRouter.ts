import express from 'express'
import { getHealth } from './healthController.js'

const healthRouter = express.Router()

healthRouter.get("/health", getHealth)

export { healthRouter }