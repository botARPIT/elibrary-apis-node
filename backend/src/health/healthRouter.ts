import express from 'express'
import { getHealth } from './healthController'

const healthRouter = express.Router()

healthRouter.get("/health", getHealth)

export { healthRouter }