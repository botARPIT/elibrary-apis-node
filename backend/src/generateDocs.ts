import { generateSpecFiles } from "./swagger.js";

async function main() {
    try {
        await generateSpecFiles()
        process.exit(0)
    } catch (error) {
        throw new Error(error as string)
        process.exit(1)
    }
}

main()