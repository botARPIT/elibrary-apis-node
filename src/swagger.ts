import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import fs from 'node:fs/promises'
import path from "node:path";
import * as yaml from 'js-yaml'

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'E-library API',
            version: '1.0.0',
            description: 'API for mapping books with file uploads',
        }
    },

    apis: [
        'src/user/userController.ts', 'src/book/bookController.ts'
    ],
}

export const specs = swaggerJSDoc(options)
export { swaggerUi }

export const generateSpecFiles = async () => {
    try {

        // Checking if the docs dir exits
        const docsDir = path.join(process.cwd(), 'docs')
        await fs.mkdir(docsDir, { recursive: true })

        // Generate JSON file
        const jsonFilePath = path.join(docsDir, 'openapi.json')
        await fs.writeFile(jsonFilePath, JSON.stringify(specs, null, 2))

        // Generate YAML file from above JSON file
        const yamlFilePath = path.join(docsDir, 'openapi.yaml')
        await fs.writeFile(yamlFilePath, yaml.dump(specs, { indent: 2 }))


    } catch (error) {
        console.error('Error generating open-api spec file')
    }
}