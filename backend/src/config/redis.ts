
import { createClient, type RedisClientType } from "redis";
import { config } from "./config.js";
import { logger } from "../utils/logger.js";

let redisClient: RedisClientType | null = null;
let isConnecting = false;
let connectionFailed = false;
let connectionPromise: Promise<RedisClientType | null> | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
    // If connection previously failed, don't retry
    if (connectionFailed) {
        return null;
    }

    // If already connected, return the client
    if (redisClient?.isOpen) {
        return redisClient;
    }

    // If a connection is in progress, wait for it
    if (isConnecting && connectionPromise) {
        return connectionPromise;
    }

    // Start a new connection
    isConnecting = true;
    connectionPromise = (async () => {
        try {
            redisClient = createClient({
                url: config.redis_url as string
            });

            redisClient.on("error", (err) => {
                logger.error({ err }, "Redis Client Error");
            });

            await redisClient.connect();
            logger.info("Connected to Redis successfully");
            return redisClient;
        } catch (err) {
            logger.error({ err }, "Failed to connect to Redis");
            redisClient = null;
            connectionFailed = true;
            return null;
        } finally {
            isConnecting = false;
            connectionPromise = null;
        }
    })();

    return connectionPromise;
}

// Initialize Redis connection (call this during server startup)
export async function initializeRedis(): Promise<void> {
    try {
        await getRedisClient();
    } catch (err) {
        logger.warn({ err }, "Redis initialization failed, caching will be disabled");
    }
}

// Export a getter for backward compatibility - but this should be migrated
export { redisClient };

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