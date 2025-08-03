"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
module.exports = (0, fastify_plugin_1.default)(async function (fastify) {
    await fastify.register(require('@fastify/rate-limit'), {
        max: 100,
        timeWindow: '1 minute',
        cache: 10000,
        allowList: ['127.0.0.1', '::1'],
        redis: undefined,
        skipOnError: true,
        keyGenerator: (request) => {
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