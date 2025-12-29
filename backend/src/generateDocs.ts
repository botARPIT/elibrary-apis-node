import { generateSpecFiles } from "./swagger.js";

async function main() {
    try {
        await generateSpecFiles()
        process.exit(0)
    } catch (error) {
        console.error("Unable to generate spec file")
        process.exit(1)
    }
}

main()