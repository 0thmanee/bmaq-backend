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
/**
 * Startups management routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get all startups with filtering
            fastify.get('/startups/list', {
                schema: {
                    tags: ['Startups'],
                    summary: 'Get all startups',
                    description: 'Get list of startups with filtering options',
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
                            status: { type: 'string', enum: ['all', 'pending', 'approved', 'rejected'] },
                            industry: { type: 'string' },
                            search: { type: 'string' },
                            limit: { type: 'number', default: 50 }
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
                                            user_id: { type: 'string' },
                                            company_name: { type: 'string' },
                                            description: { type: 'string' },
                                            industry: { type: 'string' },
                                            founded_year: { type: 'number' },
                                            team_size: { type: 'string' },
                                            website: { type: 'string' },
                                            status: { type: 'string' },
                                            created_at: { type: 'string' },
                                            updated_at: { type: 'string' },
                                            user: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    name: { type: 'string' },
                                                    email: { type: 'string' },
                                                    status: { type: 'string' },
                                                    created_at: { type: 'string' }
                                                }
                                            },
                                            budget: {
                                                type: 'object',
                                                properties: {
                                                    total_budget: { type: 'number' },
                                                    used_budget: { type: 'number' },
                                                    remaining_budget: { type: 'number' }
                                                }
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
                var _a, status_1, industry, search, _b, limit, whereConditions, startups, transformedStartups, error_1;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 2, , 3]);
                            _a = request.query, status_1 = _a.status, industry = _a.industry, search = _a.search, _b = _a.limit, limit = _b === void 0 ? 50 : _b;
                            whereConditions = {};
                            if (status_1 && status_1 !== 'all') {
                                whereConditions.status = status_1.toUpperCase();
                            }
                            if (industry && industry !== 'all') {
                                whereConditions.industry = industry;
                            }
                            if (search) {
                                whereConditions.OR = [
                                    { company_name: { contains: search, mode: 'insensitive' } },
                                    { description: { contains: search, mode: 'insensitive' } },
                                    { user: { name: { contains: search, mode: 'insensitive' } } },
                                    { user: { email: { contains: search, mode: 'insensitive' } } }
                                ];
                            }
                            return [4 /*yield*/, fastify.prisma.startup.findMany({
                                    where: whereConditions,
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                status: true,
                                                created_at: true
                                            }
                                        },
                                        budget: {
                                            select: {
                                                total_budget: true,
                                                used_budget: true,
                                                remaining_budget: true
                                            }
                                        }
                                    },
                                    take: limit,
                                    orderBy: {
                                        created_at: 'desc'
                                    }
                                })];
                        case 1:
                            startups = _c.sent();
                            transformedStartups = startups.map(function (startup) { return ({
                                id: startup.id,
                                user_id: startup.user_id,
                                company_name: startup.company_name,
                                description: startup.description || '',
                                industry: startup.industry || '',
                                founded_year: startup.founded_year || new Date().getFullYear(),
                                team_size: startup.team_size || '1-5',
                                website: startup.website || '',
                                status: startup.status.toLowerCase(),
                                created_at: startup.created_at.toISOString(),
                                updated_at: startup.updated_at.toISOString(),
                                user: {
                                    id: startup.user.id,
                                    name: startup.user.name || 'Unknown',
                                    email: startup.user.email,
                                    status: startup.user.status.toLowerCase(),
                                    created_at: startup.user.created_at.toISOString()
                                },
                                budget: startup.budget ? {
                                    total_budget: Number(startup.budget.total_budget),
                                    used_budget: Number(startup.budget.used_budget),
                                    remaining_budget: Number(startup.budget.remaining_budget)
                                } : undefined
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedStartups
                                })];
                        case 2:
                            error_1 = _c.sent();
                            fastify.log.error('Get startups list error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get startup statistics
            fastify.get('/startups/stats', {
                schema: {
                    tags: ['Startups'],
                    summary: 'Get startup statistics',
                    description: 'Get aggregated startup statistics for dashboard',
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
                                        total: { type: 'number' },
                                        pending: { type: 'number' },
                                        approved: { type: 'number' },
                                        rejected: { type: 'number' },
                                        totalBudget: { type: 'number' },
                                        usedBudget: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var total, statusCounts, pending_1, approved_1, rejected_1, budgetStats, totalBudget, usedBudget, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, fastify.prisma.startup.count()];
                        case 1:
                            total = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startup.groupBy({
                                    by: ['status'],
                                    _count: {
                                        id: true
                                    }
                                })];
                        case 2:
                            statusCounts = _a.sent();
                            pending_1 = 0, approved_1 = 0, rejected_1 = 0;
                            statusCounts.forEach(function (status) {
                                switch (status.status) {
                                    case 'PENDING':
                                        pending_1 = status._count.id;
                                        break;
                                    case 'APPROVED':
                                        approved_1 = status._count.id;
                                        break;
                                    case 'REJECTED':
                                        rejected_1 = status._count.id;
                                        break;
                                }
                            });
                            return [4 /*yield*/, fastify.prisma.startupBudget.aggregate({
                                    _sum: {
                                        total_budget: true,
                                        used_budget: true
                                    }
                                })];
                        case 3:
                            budgetStats = _a.sent();
                            totalBudget = Number(budgetStats._sum.total_budget || 0);
                            usedBudget = Number(budgetStats._sum.used_budget || 0);
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        total: total,
                                        pending: pending_1,
                                        approved: approved_1,
                                        rejected: rejected_1,
                                        totalBudget: totalBudget,
                                        usedBudget: usedBudget
                                    }
                                })];
                        case 4:
                            error_2 = _a.sent();
                            fastify.log.error('Get startup stats error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Approve or reject startup
            fastify.post('/startups/:id/action', {
                schema: {
                    tags: ['Startups'],
                    summary: 'Approve or reject startup',
                    description: 'Approve or reject a startup application',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['action'],
                        properties: {
                            action: { type: 'string', enum: ['approve', 'reject'] },
                            reason: { type: 'string' }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, reason, user, startup, defaultBudget, defaultCategories, _i, defaultCategories_1, category, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 13, , 14]);
                            id = request.params.id;
                            _a = request.body, action = _a.action, reason = _a.reason;
                            user = request.user;
                            return [4 /*yield*/, fastify.prisma.startup.findUnique({
                                    where: { id: id },
                                    include: { user: true }
                                })];
                        case 1:
                            startup = _b.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Startup not found'
                                    })];
                            }
                            if (!(action === 'approve')) return [3 /*break*/, 9];
                            // Update startup status to approved
                            return [4 /*yield*/, fastify.prisma.startup.update({
                                    where: { id: id },
                                    data: {
                                        status: 'APPROVED',
                                        approved_by: user.id,
                                        approved_at: new Date(),
                                        updated_at: new Date()
                                    }
                                })];
                        case 2:
                            // Update startup status to approved
                            _b.sent();
                            // Update user status to approved
                            return [4 /*yield*/, fastify.prisma.user.update({
                                    where: { id: startup.user_id },
                                    data: {
                                        status: 'APPROVED',
                                        updated_at: new Date()
                                    }
                                })];
                        case 3:
                            // Update user status to approved
                            _b.sent();
                            defaultBudget = 75000;
                            return [4 /*yield*/, fastify.prisma.startupBudget.upsert({
                                    where: { startup_id: id },
                                    update: {
                                        total_budget: defaultBudget,
                                        used_budget: 0,
                                        remaining_budget: defaultBudget,
                                        updated_at: new Date()
                                    },
                                    create: {
                                        startup_id: id,
                                        total_budget: defaultBudget,
                                        used_budget: 0,
                                        remaining_budget: defaultBudget
                                    }
                                })];
                        case 4:
                            _b.sent();
                            defaultCategories = [
                                { name: 'Cloud Services', allocated: 15000, color: '#3B82F6' },
                                { name: 'Marketing', allocated: 12000, color: '#10B981' },
                                { name: 'IT Tools', allocated: 8000, color: '#8B5CF6' },
                                { name: 'Events', allocated: 10000, color: '#F59E0B' },
                                { name: 'Freelances', allocated: 20000, color: '#EF4444' },
                                { name: 'Training', allocated: 10000, color: '#06B6D4' }
                            ];
                            _i = 0, defaultCategories_1 = defaultCategories;
                            _b.label = 5;
                        case 5:
                            if (!(_i < defaultCategories_1.length)) return [3 /*break*/, 8];
                            category = defaultCategories_1[_i];
                            return [4 /*yield*/, fastify.prisma.budgetCategory.upsert({
                                    where: {
                                        startup_id_name: {
                                            startup_id: id,
                                            name: category.name
                                        }
                                    },
                                    update: {
                                        budget_allocated: category.allocated,
                                        budget_used: 0,
                                        color: category.color,
                                        updated_at: new Date()
                                    },
                                    create: {
                                        startup_id: id,
                                        name: category.name,
                                        budget_allocated: category.allocated,
                                        budget_used: 0,
                                        color: category.color
                                    }
                                })];
                        case 6:
                            _b.sent();
                            _b.label = 7;
                        case 7:
                            _i++;
                            return [3 /*break*/, 5];
                        case 8: return [2 /*return*/, reply.send({
                                success: true,
                                message: 'Startup approved successfully'
                            })];
                        case 9:
                            if (!(action === 'reject')) return [3 /*break*/, 12];
                            // Update startup status to rejected
                            return [4 /*yield*/, fastify.prisma.startup.update({
                                    where: { id: id },
                                    data: {
                                        status: 'REJECTED',
                                        rejection_reason: reason || 'Application rejected',
                                        updated_at: new Date()
                                    }
                                })];
                        case 10:
                            // Update startup status to rejected
                            _b.sent();
                            // Update user status to rejected
                            return [4 /*yield*/, fastify.prisma.user.update({
                                    where: { id: startup.user_id },
                                    data: {
                                        status: 'REJECTED',
                                        updated_at: new Date()
                                    }
                                })];
                        case 11:
                            // Update user status to rejected
                            _b.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Startup rejected successfully'
                                })];
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            error_3 = _b.sent();
                            fastify.log.error('Startup action error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Get individual startup details
            fastify.get('/startups/:id', {
                schema: {
                    tags: ['Startups'],
                    summary: 'Get startup details',
                    description: 'Get detailed information about a specific startup',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    params: {
                        type: 'object',
                        required: ['id'],
                        properties: {
                            id: { type: 'string' }
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
                                        id: { type: 'string' },
                                        company_name: { type: 'string' },
                                        description: { type: 'string' },
                                        industry: { type: 'string' },
                                        founded_year: { type: 'number' },
                                        team_size: { type: 'string' },
                                        website: { type: 'string' },
                                        status: { type: 'string' },
                                        user: { type: 'object' },
                                        budget: { type: 'object' },
                                        categories: { type: 'array' },
                                        requests: { type: 'array' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, startup, transformedStartup, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = request.params.id;
                            return [4 /*yield*/, fastify.prisma.startup.findUnique({
                                    where: { id: id },
                                    include: {
                                        user: {
                                            select: {
                                                id: true,
                                                name: true,
                                                email: true,
                                                status: true,
                                                created_at: true
                                            }
                                        },
                                        budget: true,
                                        budget_categories: true,
                                        budget_requests: {
                                            orderBy: { created_at: 'desc' },
                                            take: 10
                                        }
                                    }
                                })];
                        case 1:
                            startup = _a.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Startup not found'
                                    })];
                            }
                            transformedStartup = {
                                id: startup.id,
                                company_name: startup.company_name,
                                description: startup.description || '',
                                industry: startup.industry || '',
                                founded_year: startup.founded_year || new Date().getFullYear(),
                                team_size: startup.team_size || '1-5',
                                website: startup.website || '',
                                status: startup.status.toLowerCase(),
                                created_at: startup.created_at.toISOString(),
                                updated_at: startup.updated_at.toISOString(),
                                user: {
                                    id: startup.user.id,
                                    name: startup.user.name || 'Unknown',
                                    email: startup.user.email,
                                    status: startup.user.status.toLowerCase(),
                                    created_at: startup.user.created_at.toISOString()
                                },
                                budget: startup.budget ? {
                                    total_budget: Number(startup.budget.total_budget),
                                    used_budget: Number(startup.budget.used_budget),
                                    remaining_budget: Number(startup.budget.remaining_budget)
                                } : null,
                                categories: startup.budget_categories.map(function (cat) { return ({
                                    name: cat.name,
                                    allocated: Number(cat.budget_allocated),
                                    used: Number(cat.budget_used),
                                    color: cat.color
                                }); }),
                                requests: startup.budget_requests.map(function (req) { return ({
                                    id: req.id,
                                    category: req.category,
                                    description: req.description,
                                    amount: Number(req.amount),
                                    status: req.status.toLowerCase(),
                                    created_at: req.created_at.toISOString()
                                }); })
                            };
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedStartup
                                })];
                        case 2:
                            error_4 = _a.sent();
                            fastify.log.error('Get startup details error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
