"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
module.exports = (0, fastify_plugin_1.default)(async function (fastify) {
    await fastify.register(require('@fastify/swagger'), {
        swagger: {
            info: {
                title: 'BMAQ Backend API',
                description: 'Backend API for BMAQ - Startup Incubator Management Platform',
                version: '1.0.0',
            },
            host: `localhost:${process.env.PORT || 3294}`,
            schemes: ['http', 'https'],
            consumes: ['application/json'],
            produces: ['application/json'],
            tags: [
                { name: 'Auth', description: 'Authentication related endpoints' },
                { name: 'Users', description: 'User management endpoints' },
                { name: 'Startups', description: 'Startup management endpoints' },
                { name: 'Budget', description: 'Budget management endpoints' },
                { name: 'Events', description: 'Event management endpoints' },
                { name: 'Resources', description: 'Resource management endpoints' },
                { name: 'Suivi', description: 'Suivi form management endpoints' },
                { name: 'Health', description: 'Health check endpoints' },
            ],
            definitions: {
                User: {
                    type: 'object',
                    required: ['id', 'email', 'role', 'status'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        name: { type: 'string' },
                        role: { type: 'string', enum: ['admin', 'startup'] },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        email_verified: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Startup: {
                    type: 'object',
                    required: ['id', 'user_id', 'company_name', 'status'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        user_id: { type: 'string', format: 'uuid' },
                        company_name: { type: 'string' },
                        description: { type: 'string' },
                        industry: { type: 'string' },
                        founded_year: { type: 'number' },
                        team_size: { type: 'string' },
                        website: { type: 'string', format: 'uri' },
                        logo_url: { type: 'string', format: 'uri' },
                        status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
                        created_at: { type: 'string', format: 'date-time' },
                        updated_at: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    required: ['error', 'message'],
                    properties: {
                        error: { type: 'string' },
                        message: { type: 'string' },
                        statusCode: { type: 'number' },
                    },
                },
            },
            securityDefinitions: {
                apiKey: {
                    type: 'apiKey',
                    name: 'Authorization',
                    in: 'header',
                },
            },
        },
    });
    await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'full',
            deepLinking: false,
        },
        staticCSP: true,
    });
});
//# sourceMappingURL=swagger.js.map