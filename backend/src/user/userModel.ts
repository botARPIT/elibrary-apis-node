import mongoose, { type InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        maxLength: 50,
    },
    password: {
        type: String,
        required: true,
        minLength: 8,
        maxLength: 200
    },

}, {
    timestamps: true
})

export type UserDocument = InferSchemaType<typeof userSchema>

export const User = mongoose.model<UserDocument>("User", userSchema)