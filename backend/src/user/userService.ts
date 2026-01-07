import { User } from "./userModel.js";
import type { userRegisterDTO } from "./userTypes.js";
import { hashPassword } from "../utils/hash.js";
import { createJWT } from "../utils/jwt.js";
import { logger } from "../utils/logger.js";

class UserService {
    async createUser(dto: userRegisterDTO) {
        const hashedPassword = await hashPassword(dto.password)
        const user = new User({ name: dto.name, email: dto.email, password: hashedPassword });
        const createdUser = await user.save()
        const token = createJWT({ id: String(createdUser._id) })
        logger.debug({ userId: createdUser._id }, "User created")
        return { createdUser, token }
    }

    async findUserByEmail(email: userRegisterDTO["email"]) {
        return await User.findOne({ email })
    }
}

export const userService = new UserService