"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
/**
 * Health check routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Health check endpoint
            fastify.get('/health', {
                schema: {
                    tags: ['Health'],
                    summary: 'Health check endpoint',
                    description: 'Check if the server is running and can connect to the database',
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                timestamp: { type: 'string' },
                                uptime: { type: 'number' },
                                database: { type: 'string' },
                                version: { type: 'string' },
                                environment: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Test database connection
                            return [4 /*yield*/, fastify.prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                        case 1:
                            // Test database connection
                            _a.sent();
                            return [2 /*return*/, {
                                    status: 'healthy',
                                    timestamp: new Date().toISOString(),
                                    uptime: process.uptime(),
                                    database: 'connected',
                                    version: process.env.npm_package_version || '1.0.0',
                                    environment: process.env.NODE_ENV || 'development',
                                }];
                        case 2:
                            error_1 = _a.sent();
                            reply.code(503);
                            return [2 /*return*/, {
                                    status: 'unhealthy',
                                    timestamp: new Date().toISOString(),
                                    uptime: process.uptime(),
                                    database: 'disconnected',
                                    version: process.env.npm_package_version || '1.0.0',
                                    environment: process.env.NODE_ENV || 'development',
                                    error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Liveness probe (for Kubernetes)
            fastify.get('/health/live', {
                schema: {
                    tags: ['Health'],
                    summary: 'Liveness probe',
                    description: 'Check if the server is alive',
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                timestamp: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, {
                            status: 'alive',
                            timestamp: new Date().toISOString(),
                        }];
                });
            }); });
            // Readiness probe (for Kubernetes)
            fastify.get('/health/ready', {
                schema: {
                    tags: ['Health'],
                    summary: 'Readiness probe',
                    description: 'Check if the server is ready to serve requests',
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                timestamp: { type: 'string' },
                                database: { type: 'string' },
                            },
                        },
                    },
                },
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Test database connection
                            return [4 /*yield*/, fastify.prisma.$queryRaw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                        case 1:
                            // Test database connection
                            _a.sent();
                            return [2 /*return*/, {
                                    status: 'ready',
                                    timestamp: new Date().toISOString(),
                                    database: 'connected',
                                }];
                        case 2:
                            error_2 = _a.sent();
                            reply.code(503);
                            return [2 /*return*/, {
                                    status: 'not ready',
                                    timestamp: new Date().toISOString(),
                                    database: 'disconnected',
                                    error: error_2 instanceof Error ? error_2.message : 'Unknown error',
                                }];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
var templateObject_1, templateObject_2;
