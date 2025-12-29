import express from 'express'
import { getMetric } from './metricsController'

const metricRouter = express.Router()

metricRouter.get("/metrics", getMetric)