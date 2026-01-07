import express from 'express'
import { createUser, loginUser } from './userController.js'
import { authLimiter } from '../middlewares/rateLimiter.js'

const userRouter = express.Router()
userRouter.post("/register", authLimiter, createUser)
userRouter.post("/login", authLimiter, loginUser)

export default userRouter