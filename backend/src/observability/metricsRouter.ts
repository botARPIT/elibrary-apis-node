import express from 'express'
import { getMetric } from './metricsController.js'

const metricRouter = express.Router()

metricRouter.get("/metrics", getMetric)

export { metricRouter }