"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
/**
 * Helmet plugin for security headers
 */
module.exports = (0, fastify_plugin_1.default)(async function (fastify) {
    await fastify.register(require('@fastify/helmet'), {
        global: true,
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
        },
        crossOriginEmbedderPolicy: false,
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
        },
        noSniff: true,
        originAgentCluster: true,
        dnsPrefetchControl: true,
        frameguard: { action: 'deny' },
        ieNoOpen: true,
        xssFilter: true,
    });
});
//# sourceMappingURL=helmet.js.map