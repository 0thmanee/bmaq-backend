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
var jsonwebtoken_1 = require("jsonwebtoken");
var JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
// Authentication middleware
function authenticateAdmin(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, decoded;
        return __generator(this, function (_a) {
            try {
                authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return [2 /*return*/, reply.code(401).send({
                            success: false,
                            message: 'No token provided'
                        })];
                }
                token = authHeader.split(' ')[1];
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Check if user is admin
                if (decoded.role !== 'ADMIN') {
                    return [2 /*return*/, reply.code(403).send({
                            success: false,
                            message: 'Admin access required'
                        })];
                }
                // Add user info to request
                request.user = decoded;
            }
            catch (error) {
                return [2 /*return*/, reply.code(401).send({
                        success: false,
                        message: 'Invalid token'
                    })];
            }
            return [2 /*return*/];
        });
    });
}
// User authentication middleware
function authenticateUser(request, reply) {
    return __awaiter(this, void 0, void 0, function () {
        var authHeader, token, decoded;
        return __generator(this, function (_a) {
            try {
                authHeader = request.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                    return [2 /*return*/, reply.code(401).send({
                            success: false,
                            message: 'No token provided'
                        })];
                }
                token = authHeader.split(' ')[1];
                decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Add user info to request
                request.user = decoded;
            }
            catch (error) {
                return [2 /*return*/, reply.code(401).send({
                        success: false,
                        message: 'Invalid token'
                    })];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Dashboard routes for admin statistics
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get admin dashboard overview statistics
            fastify.get('/dashboard/overview', {
                schema: {
                    tags: ['Dashboard'],
                    summary: 'Get admin dashboard overview statistics',
                    description: 'Get aggregated statistics for admin dashboard',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        totalStartups: { type: 'number' },
                                        activeFounders: { type: 'number' },
                                        totalBudgetAllocated: { type: 'number' },
                                        totalBudgetUsed: { type: 'number' },
                                        budgetUsagePercentage: { type: 'number' },
                                        pendingRequests: { type: 'number' },
                                        upcomingEvents: { type: 'number' },
                                        resourcesUploaded: { type: 'number' },
                                        questionnairesCompleted: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var totalStartups, activeFounders, budgetStats, totalBudgetAllocated, totalBudgetUsed, budgetUsagePercentage, pendingRequests, upcomingEvents, resourcesUploaded, questionnairesCompleted, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 8, , 9]);
                            return [4 /*yield*/, fastify.prisma.startup.count()];
                        case 1:
                            totalStartups = _a.sent();
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED'
                                    }
                                })];
                        case 2:
                            activeFounders = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startupBudget.aggregate({
                                    _sum: {
                                        total_budget: true,
                                        used_budget: true
                                    }
                                })];
                        case 3:
                            budgetStats = _a.sent();
                            totalBudgetAllocated = Number(budgetStats._sum.total_budget || 0);
                            totalBudgetUsed = Number(budgetStats._sum.used_budget || 0);
                            budgetUsagePercentage = totalBudgetAllocated > 0
                                ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100)
                                : 0;
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: {
                                        status: 'PENDING'
                                    }
                                })];
                        case 4:
                            pendingRequests = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: {
                                        date: {
                                            gte: new Date()
                                        },
                                        status: {
                                            in: ['UPCOMING', 'DRAFT']
                                        }
                                    }
                                })];
                        case 5:
                            upcomingEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.count()];
                        case 6:
                            resourcesUploaded = _a.sent();
                            return [4 /*yield*/, fastify.prisma.suiviResponse.count()];
                        case 7:
                            questionnairesCompleted = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalStartups: totalStartups,
                                        activeFounders: activeFounders,
                                        totalBudgetAllocated: totalBudgetAllocated,
                                        totalBudgetUsed: totalBudgetUsed,
                                        budgetUsagePercentage: budgetUsagePercentage,
                                        pendingRequests: pendingRequests,
                                        upcomingEvents: upcomingEvents,
                                        resourcesUploaded: resourcesUploaded,
                                        questionnairesCompleted: questionnairesCompleted
                                    }
                                })];
                        case 8:
                            error_1 = _a.sent();
                            fastify.log.error('Dashboard overview error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 9: return [2 /*return*/];
                    }
                });
            }); });
            // Get recent activity for dashboard
            fastify.get('/dashboard/activity', {
                schema: {
                    tags: ['Dashboard'],
                    summary: 'Get recent activity for admin dashboard',
                    description: 'Get recent activities across the platform',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    querystring: {
                        type: 'object',
                        properties: {
                            limit: { type: 'number', default: 10 }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            type: { type: 'string' },
                                            user: { type: 'string' },
                                            action: { type: 'string' },
                                            amount: { type: 'number' },
                                            details: { type: 'string' },
                                            time: { type: 'string' },
                                            status: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var query, limit, activities_1, recentRequests, recentEvents, recentResources, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = request.query;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 5, , 6]);
                            limit = query.limit || 10;
                            activities_1 = [];
                            return [4 /*yield*/, fastify.prisma.budgetRequest.findMany({
                                    take: Math.floor(limit / 2),
                                    orderBy: { created_at: 'desc' },
                                    include: {
                                        startup: { select: { company_name: true } },
                                        user: { select: { name: true } }
                                    }
                                })];
                        case 2:
                            recentRequests = _a.sent();
                            recentRequests.forEach(function (request) {
                                activities_1.push({
                                    id: "request-".concat(request.id),
                                    type: 'request',
                                    user: request.startup.company_name,
                                    action: 'submitted budget request',
                                    amount: Number(request.amount),
                                    details: request.category,
                                    time: formatTimeAgo(request.created_at),
                                    status: request.status.toLowerCase()
                                });
                            });
                            return [4 /*yield*/, fastify.prisma.event.findMany({
                                    take: Math.floor(limit / 4),
                                    orderBy: { created_at: 'desc' }
                                })];
                        case 3:
                            recentEvents = _a.sent();
                            recentEvents.forEach(function (event) {
                                activities_1.push({
                                    id: "event-".concat(event.id),
                                    type: 'event',
                                    user: 'Admin',
                                    action: 'created new event',
                                    details: event.title,
                                    time: formatTimeAgo(event.created_at),
                                    status: 'active'
                                });
                            });
                            return [4 /*yield*/, fastify.prisma.resource.findMany({
                                    take: Math.floor(limit / 4),
                                    orderBy: { created_at: 'desc' },
                                    include: {
                                        uploader: { select: { name: true } }
                                    }
                                })];
                        case 4:
                            recentResources = _a.sent();
                            recentResources.forEach(function (resource) {
                                activities_1.push({
                                    id: "resource-".concat(resource.id),
                                    type: 'resource',
                                    user: resource.uploader.name || 'Admin',
                                    action: 'uploaded new resource',
                                    details: resource.title,
                                    time: formatTimeAgo(resource.created_at),
                                    status: 'active'
                                });
                            });
                            // Sort all activities by time (most recent first)
                            activities_1.sort(function (a, b) {
                                // Convert time ago to sortable format (this is simplified)
                                return b.id.localeCompare(a.id);
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: activities_1.slice(0, limit)
                                })];
                        case 5:
                            error_2 = _a.sent();
                            fastify.log.error('Dashboard activity error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Get system health status
            fastify.get('/dashboard/health', {
                schema: {
                    tags: ['Dashboard'],
                    summary: 'Get system health status',
                    description: 'Get system health indicators for admin dashboard',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        database: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                                responseTime: { type: 'number' }
                                            }
                                        },
                                        api: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                                uptime: { type: 'number' }
                                            }
                                        },
                                        storage: {
                                            type: 'object',
                                            properties: {
                                                status: { type: 'string' },
                                                usage: { type: 'number' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var dbStart, dbResponseTime, storageUsage, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            dbStart = Date.now();
                            return [4 /*yield*/, fastify.prisma.$queryRaw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["SELECT 1"], ["SELECT 1"])))];
                        case 1:
                            _a.sent();
                            dbResponseTime = Date.now() - dbStart;
                            storageUsage = Math.floor(Math.random() * 30) + 60;
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        database: {
                                            status: 'healthy',
                                            responseTime: dbResponseTime
                                        },
                                        api: {
                                            status: 'healthy',
                                            uptime: process.uptime()
                                        },
                                        storage: {
                                            status: storageUsage > 85 ? 'warning' : 'healthy',
                                            usage: storageUsage
                                        }
                                    }
                                })];
                        case 2:
                            error_3 = _a.sent();
                            fastify.log.error('Dashboard health error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get user dashboard data
            fastify.get('/dashboard/user', {
                schema: {
                    tags: ['Dashboard'],
                    summary: 'Get user dashboard data',
                    description: 'Get dashboard data for authenticated startup user',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        budget: {
                                            type: 'object',
                                            properties: {
                                                total: { type: 'number' },
                                                used: { type: 'number' },
                                                remaining: { type: 'number' },
                                                categories: {
                                                    type: 'array',
                                                    items: {
                                                        type: 'object',
                                                        properties: {
                                                            name: { type: 'string' },
                                                            budget: { type: 'number' },
                                                            used: { type: 'number' },
                                                            color: { type: 'string' },
                                                            percentage: { type: 'number' }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        recentRequests: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number' },
                                                    title: { type: 'string' },
                                                    date: { type: 'string' },
                                                    status: { type: 'string' },
                                                    category: { type: 'string' },
                                                    amount: { type: 'string' }
                                                }
                                            }
                                        },
                                        upcomingEvents: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number' },
                                                    title: { type: 'string' },
                                                    date: { type: 'string' },
                                                    time: { type: 'string' },
                                                    type: { type: 'string' },
                                                    status: { type: 'string' },
                                                    participants: { type: 'number' },
                                                    maxParticipants: { type: 'number' }
                                                }
                                            }
                                        },
                                        recentResources: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number' },
                                                    title: { type: 'string' },
                                                    category: { type: 'string' },
                                                    type: { type: 'string' },
                                                    size: { type: 'string' },
                                                    downloads: { type: 'number' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateUser
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var user, startup, budget, categories, budgetData, recentRequests, upcomingEvents, recentResources, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            user = request.user;
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: { user_id: user.id },
                                    include: {
                                        user: true,
                                        budget: {
                                            include: {
                                                categories: true
                                            }
                                        }
                                    }
                                })];
                        case 1:
                            startup = _a.sent();
                            if (!startup) {
                                // Return empty data if no startup found
                                return [2 /*return*/, reply.send({
                                        success: true,
                                        data: {
                                            budget: {
                                                total: 0,
                                                used: 0,
                                                remaining: 0,
                                                categories: []
                                            },
                                            recentRequests: [],
                                            upcomingEvents: [],
                                            recentResources: []
                                        }
                                    })];
                            }
                            budget = startup.budget;
                            categories = (budget === null || budget === void 0 ? void 0 : budget.categories) || [];
                            budgetData = {
                                total: Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0),
                                used: Number((budget === null || budget === void 0 ? void 0 : budget.used_budget) || 0),
                                remaining: Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0) - Number((budget === null || budget === void 0 ? void 0 : budget.used_budget) || 0),
                                categories: categories.map(function (cat) { return ({
                                    name: cat.name,
                                    budget: Number(cat.allocated_amount),
                                    used: Number(cat.used_amount),
                                    color: getCategoryColor(cat.name),
                                    percentage: Number(cat.allocated_amount) > 0 ? Math.round((Number(cat.used_amount) / Number(cat.allocated_amount)) * 100) : 0
                                }); })
                            };
                            return [4 /*yield*/, fastify.prisma.budgetRequest.findMany({
                                    where: {
                                        startup_id: startup.id
                                    },
                                    orderBy: { created_at: 'desc' },
                                    take: 3
                                })];
                        case 2:
                            recentRequests = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.findMany({
                                    where: {
                                        date: {
                                            gte: new Date()
                                        },
                                        status: {
                                            in: ['UPCOMING', 'OPEN']
                                        }
                                    },
                                    orderBy: { date: 'asc' },
                                    take: 4
                                })];
                        case 3:
                            upcomingEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.findMany({
                                    where: {
                                        is_public: true
                                    },
                                    orderBy: { created_at: 'desc' },
                                    take: 3
                                })];
                        case 4:
                            recentResources = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        budget: budgetData,
                                        recentRequests: recentRequests.map(function (req) { return ({
                                            id: req.id,
                                            title: req.description,
                                            date: req.created_at.toISOString().split('T')[0],
                                            status: req.status,
                                            category: req.category,
                                            amount: "$".concat(Number(req.amount).toLocaleString())
                                        }); }),
                                        upcomingEvents: upcomingEvents.map(function (event) { return ({
                                            id: event.id,
                                            title: event.title,
                                            date: event.date.toISOString().split('T')[0],
                                            time: event.time,
                                            type: event.type,
                                            status: event.status,
                                            participants: event.current_attendees || 0,
                                            maxParticipants: event.max_attendees || 0
                                        }); }),
                                        recentResources: recentResources.map(function (resource) { return ({
                                            id: resource.id,
                                            title: resource.title,
                                            category: resource.category,
                                            type: resource.type,
                                            size: resource.file_size || 'N/A',
                                            downloads: resource.downloads || 0
                                        }); })
                                    }
                                })];
                        case 5:
                            error_4 = _a.sent();
                            fastify.log.error('User dashboard error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
// Helper function to format time ago
function formatTimeAgo(date) {
    var now = new Date();
    var diffInMs = now.getTime() - date.getTime();
    var diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    var diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    var diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInMinutes < 1)
        return 'Just now';
    if (diffInMinutes < 60)
        return "".concat(diffInMinutes, " minute").concat(diffInMinutes > 1 ? 's' : '', " ago");
    if (diffInHours < 24)
        return "".concat(diffInHours, " hour").concat(diffInHours > 1 ? 's' : '', " ago");
    return "".concat(diffInDays, " day").concat(diffInDays > 1 ? 's' : '', " ago");
}
// Helper function to get category colors
function getCategoryColor(category) {
    var colors = {
        'Cloud': '#94182C',
        'Marketing': '#dc2626',
        'IT': '#7c2d12',
        'Expos': '#991b1b',
        'Events': '#991b1b',
        'Freelances': '#b91c1c',
        'Training': '#059669',
        'Infrastructure': '#0d9488',
        'Tools': '#0891b2',
        'Other': '#6b7280'
    };
    return colors[category] || '#6b7280';
}
var templateObject_1;
