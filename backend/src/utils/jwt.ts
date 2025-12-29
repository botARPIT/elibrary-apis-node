import jwt from 'jsonwebtoken'
import { config } from '../config/config.js'
import type { userJWTPayload } from '../user/userTypes.js'

function createJWT(payload: userJWTPayload) {
    return jwt.sign({ sub: payload }, config.jwt_secret as string, { expiresIn: '3h' })
}

function verifyJWT(jwtToken: string) {

    return jwt.verify(jwtToken, config.jwt_secret as string)
}

export { createJWT, verifyJWT }

