import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';
import type { Request, Response } from 'express';

/**
 * General API rate limiter
 * Limits: 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req: Request, res: Response) => {
        logger.warn({
            ip: req.ip,
            path: req.path,
            userAgent: req.get('user-agent')
        }, 'Rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'Too many requests, please try again later.'
        });
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits: 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/register attempts
    skipSuccessfulRequests: true, // Don't count successful requests
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn({
            ip: req.ip,
            path: req.path,
            attempts: 5
        }, 'Auth rate limit exceeded - possible brute force attack');
        res.status(429).json({
            success: false,
            message: 'Too many login attempts. Please try again in 15 minutes.'
        });
    }
});

/**
 * Upload rate limiter
 * Limits: 10 uploads per hour per IP
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 uploads per hour
    message: 'Upload limit reached. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
        logger.warn({
            ip: req.ip,
            userId: (req as any).sub?.id,
        }, 'Upload rate limit exceeded');
        res.status(429).json({
            success: false,
            message: 'You have reached the upload limit. Please try again in an hour.'
        });
    }
});
