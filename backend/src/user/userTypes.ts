import { z } from 'zod'
import { sanitizeInput } from '../utils/sanitize.js'

interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    createdAt: Date,
    updatedAt: Date
}
export const userRegisterSchema = z.object({
    name: z.string().min(2).max(20).transform((val) => sanitizeInput(val)),
    email: z.email().toLowerCase().max(50).transform((val) => sanitizeInput(val).toLowerCase()),
    password: z.string().min(8).max(70).trim().transform((val) => sanitizeInput(val))
})

export const userLogicSchema = z.object({
    email: z.email().toLowerCase().max(50).transform((val) => sanitizeInput(val).toLowerCase()),
    password: z.string().min(8).max(70).trim().transform((val) => sanitizeInput(val))
})

export type userRegisterDTO = z.infer<typeof userRegisterSchema>
export type userLoginDTO = Pick<userRegisterDTO, "email" | "password">
export type userJWTPayload = {
    id: string
    name: string
    email: string
}

export type UserDTO = User