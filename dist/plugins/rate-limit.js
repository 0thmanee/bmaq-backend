"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
/**
 * Rate limiting plugin for API protection
 */
module.exports = (0, fastify_plugin_1.default)(async function (fastify) {
    await fastify.register(require('@fastify/rate-limit'), {
        max: 100, // Maximum 100 requests per timeWindow
        timeWindow: '1 minute', // 1 minute window
        cache: 10000, // Cache up to 10,000 different client IPs
        allowList: ['127.0.0.1', '::1'], // Allow localhost
        redis: undefined, // Can be configured with Redis for distributed systems
        skipOnError: true, // Skip rate limiting on errors
        keyGenerator: (request) => {
            // Use IP address as key for rate limiting
            return request.ip;
        },
        errorResponseBuilder: (request, context) => {
            return {
                code: 429,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${Math.round(context.ttl / 1000)} seconds.`,
                date: Date.now(),
                expiresIn: Math.round(context.ttl / 1000),
            };
        },
        onExceeding: (request, key) => {
            fastify.log.warn(`Rate limit exceeded for ${key}`);
        },
        onExceeded: (request, key) => {
            fastify.log.error(`Rate limit exceeded for ${key}`);
        },
    });
});
//# sourceMappingURL=rate-limit.js.map