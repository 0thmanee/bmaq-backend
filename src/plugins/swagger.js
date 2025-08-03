"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fastify_plugin_1 = require("fastify-plugin");
/**
 * Swagger plugin for API documentation
 */
module.exports = (0, fastify_plugin_1.default)(function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fastify.register(require('@fastify/swagger'), {
                        swagger: {
                            info: {
                                title: 'BMAQ Backend API',
                                description: 'Backend API for BMAQ - Startup Incubator Management Platform',
                                version: '1.0.0',
                            },
                            host: "localhost:".concat(process.env.PORT || 3294),
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
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fastify.register(require('@fastify/swagger-ui'), {
                            routePrefix: '/docs',
                            uiConfig: {
                                docExpansion: 'full',
                                deepLinking: false,
                            },
                            staticCSP: true,
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
