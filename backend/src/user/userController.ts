import type { NextFunction, Request, Response } from "express";
import { userLogicSchema, userRegisterSchema, type userLoginDTO, type userRegisterDTO } from "./userTypes.js";
import createHttpError from "http-errors";
import { userService } from "./userService.js";
import { ZodError } from "zod";
import { MongooseError } from "mongoose";
import jwt from "jsonwebtoken";
import { verifyHash } from "../utils/hash.js";
import { createJWT } from "../utils/jwt.js";


/**
 * @swagger
 * components: 
 *   schemas:
 *     User:
 *       type: object
 *       properties: 
 *         _id:
 *           type: string
 *           description: Unique user identifier
 *           example: "90a7b8c9d1e2f3a4b5c6d7i0"
 *         name:
 *           type: string
 *           description: User name
 *           example: "Tester"
 *         email: 
 *           type: string
 *           description: Unique user email
 *           example: "tester@mail.com"
 *         password: 
 *           type: string
 *           description: User password
 *           example: "This is a testing pass"
 *
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties: 
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 20
 *           description: User name
 *           example: "Tester"
 *         email: 
 *           type: string
 *           maxLength: 50
 *           description: Unique user email
 *           example: "tester@mail.com"
 *         password: 
 *           type: string
 *           minLength: 8
 *           maxLength: 70
 *           description: User password
 *           example: "This is a testing pass"
 *
 *     CreateUserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: User created
 *         id:
 *           type: string
 *           description: Newly created user ID
 *           example: "90a7b8c9d1e2f3a4b5c6d7i0"
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 * 
 *     LoginUserRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *           example: "tester@mail.com"
 *         password:
 *           type: string
 *           description: User password
 *           example: "This is a testing pass"
 *
 *     LoginUserResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Login successful
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 *     UserErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: Invalid credentials
 */



/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user in the system.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: User successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created
 *                 id:
 *                   type: string
 *                   example: "90a7b8c9d1e2f3a4b5c6d7i0"
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: User already exists / Invalid request payload
 *       500:
 *         description: Internal server error
 */




const createUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: userRegisterDTO = userRegisterSchema.parse(req.body)
        const existingUser = await userService.findUserByEmail(data.email)
        if (existingUser) return next(createHttpError(400, "User already exists with this email"))
        const { createdUser, token } = await userService.createUser(data)
        res.status(201).json({ message: "User created", id: createdUser._id, accessToken: token })
    } catch (error) {
        if (error instanceof ZodError) {
            return next(createHttpError(400, "Invalid request payload"))
        } else if (error instanceof MongooseError) {
            return next(createHttpError(500, "Database Error"))
        } else if (error instanceof jwt.JsonWebTokenError) {
            return next(createHttpError(500, "Unable to create jwt token"))
        }
        else if (error instanceof Error) {
            return next(createHttpError(500, error.message))
        }
        next(error)
    }
}

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user
 *     description: Logs in a user and returns an access token.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: tester@mail.com
 *               password:
 *                 type: string
 *                 example: "This is a testing pass"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */


const loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data: userLoginDTO = userLogicSchema.parse(req.body)
        let token;
        const user = await userService.findUserByEmail(data.email)
        if (!user) return next(createHttpError(404, "User not found"))
        const isValidPass = await verifyHash(data.password, user.password)
        if (!isValidPass) return next(createHttpError(401, "Invalid credentials"))
        if (isValidPass) { token = createJWT({ id: String(user._id) }) }
        res.status(200).json({ message: "Login successful", accessToken: token })
    } catch (error) {
        if (error instanceof ZodError) {
            return next(createHttpError(400, "Invalid request payload"))
        } else if (error instanceof MongooseError) {
            return next(createHttpError(500, "Database Error"))
        } else if (error instanceof jwt.JsonWebTokenError) {
            return next(createHttpError(500, "Unable to create jwt token"))
        }
        else if (error instanceof Error) {
            return next(createHttpError(500, error.message))
        }
        next(error)
    }



}

export { createUser, loginUser }