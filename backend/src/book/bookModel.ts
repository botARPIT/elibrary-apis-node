import mongoose from "mongoose";
import { BookGenre, type BookInfo } from "./bookTypes.js";
import { User } from "../user/userModel.js";

const bookSchema = new mongoose.Schema<BookInfo>({
    title: {
        type: String,
        required: true,
        minLength: 2,
        maxLength: 80
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    genre: {
        type: String,
        enum: Object.values(BookGenre),
        required: true
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    }
}, { timestamps: true })


export const Book = mongoose.model("Books", bookSchema)