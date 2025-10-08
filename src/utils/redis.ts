
import { createClient } from "redis";

export const redisClient = await createClient()
    .on("error", (err) => { throw new Error("Unable to connect to Redis"), err })
    .connect()


export function generateRedisKey(url: string, controllerName: string): string | null {
    const [path, query] = url.split('?')
    if (!path) return null
    const pathKey = path.replace(/^\//, '').replace(/\//g, ":")

    if (!query) return `${controllerName}:${pathKey}`

    const queryKey = query
        .split('&')
        .map(param => param.replace('=', ':'))
        .join(":")

    return `${controllerName}:${pathKey}:${queryKey}`
}