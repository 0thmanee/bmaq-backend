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
// Authentication middleware for regular users
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
 * Budget management routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get all startup budgets overview
            fastify.get('/budget/overview', {
                schema: {
                    tags: ['Budget'],
                    summary: 'Get all startup budget overviews',
                    description: 'Get comprehensive budget information for all startups',
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
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            startupName: { type: 'string' },
                                            founderName: { type: 'string' },
                                            totalAllocated: { type: 'number' },
                                            totalUsed: { type: 'number' },
                                            categories: { type: 'object' },
                                            status: { type: 'string' },
                                            lastUpdate: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var startups, budgetOverview, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fastify.prisma.startup.findMany({
                                    where: {
                                        status: 'APPROVED'
                                    },
                                    include: {
                                        user: {
                                            select: {
                                                name: true,
                                                email: true
                                            }
                                        },
                                        budget: true,
                                        budget_categories: true
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    }
                                })];
                        case 1:
                            startups = _a.sent();
                            budgetOverview = startups.map(function (startup, index) {
                                // Group categories by name
                                var categories = {};
                                startup.budget_categories.forEach(function (category) {
                                    var key = category.name.toLowerCase().replace(' ', '');
                                    categories[key] = {
                                        allocated: Number(category.budget_allocated),
                                        used: Number(category.budget_used)
                                    };
                                });
                                // Ensure all expected categories exist with default values
                                var defaultCategories = ['cloud', 'marketing', 'it', 'events', 'freelances', 'training'];
                                defaultCategories.forEach(function (cat) {
                                    if (!categories[cat]) {
                                        categories[cat] = { allocated: 0, used: 0 };
                                    }
                                });
                                return {
                                    id: index + 1, // Frontend expects numeric ID
                                    startupName: startup.company_name,
                                    founderName: startup.user.name || 'Unknown',
                                    totalAllocated: startup.budget ? Number(startup.budget.total_budget) : 0,
                                    totalUsed: startup.budget ? Number(startup.budget.used_budget) : 0,
                                    categories: categories,
                                    status: 'active', // All approved startups are considered active
                                    lastUpdate: startup.updated_at.toISOString().split('T')[0] // Format as YYYY-MM-DD
                                };
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: budgetOverview
                                })];
                        case 2:
                            error_1 = _a.sent();
                            fastify.log.error('Budget overview error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get budget statistics
            fastify.get('/budget/stats', {
                schema: {
                    tags: ['Budget'],
                    summary: 'Get budget statistics',
                    description: 'Get aggregated budget statistics for the dashboard',
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
                                        totalAllocated: { type: 'number' },
                                        totalUsed: { type: 'number' },
                                        totalRemaining: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var totalStartups, budgetStats, totalAllocated, totalUsed, totalRemaining, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fastify.prisma.startup.count({
                                    where: { status: 'APPROVED' }
                                })];
                        case 1:
                            totalStartups = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startupBudget.aggregate({
                                    _sum: {
                                        total_budget: true,
                                        used_budget: true,
                                        remaining_budget: true
                                    }
                                })];
                        case 2:
                            budgetStats = _a.sent();
                            totalAllocated = Number(budgetStats._sum.total_budget || 0);
                            totalUsed = Number(budgetStats._sum.used_budget || 0);
                            totalRemaining = Number(budgetStats._sum.remaining_budget || 0);
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalStartups: totalStartups,
                                        totalAllocated: totalAllocated,
                                        totalUsed: totalUsed,
                                        totalRemaining: totalRemaining
                                    }
                                })];
                        case 3:
                            error_2 = _a.sent();
                            fastify.log.error('Budget stats error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Create new budget allocation
            fastify.post('/budget/allocate', {
                schema: {
                    tags: ['Budget'],
                    summary: 'Create new budget allocation',
                    description: 'Allocate budget to a startup with category breakdown',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['startupName', 'founderName', 'totalBudget', 'categories'],
                        properties: {
                            startupName: { type: 'string' },
                            founderName: { type: 'string' },
                            totalBudget: { type: 'number' },
                            categories: {
                                type: 'object',
                                properties: {
                                    cloud: { type: 'number' },
                                    marketing: { type: 'number' },
                                    it: { type: 'number' },
                                    events: { type: 'number' },
                                    freelances: { type: 'number' },
                                    training: { type: 'number' }
                                }
                            }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                message: { type: 'string' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        budgetId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var body, startupName, founderName, totalBudget, categories, categoryTotal, startup, existingBudget, currentTotal, newTotalBudget, newRemainingBudget, budget, categoryNames, _i, _a, _b, key, amount, existingCategory, currentCategoryBudget, newCategoryBudget, error_3;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            body = request.body;
                            _c.label = 1;
                        case 1:
                            _c.trys.push([1, 10, , 11]);
                            startupName = body.startupName, founderName = body.founderName, totalBudget = body.totalBudget, categories = body.categories;
                            categoryTotal = Object.values(categories).reduce(function (sum, amount) { return sum + amount; }, 0);
                            if (categoryTotal > totalBudget) {
                                return [2 /*return*/, reply.code(400).send({
                                        success: false,
                                        message: 'Category allocations cannot exceed total budget'
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: {
                                        company_name: {
                                            equals: startupName,
                                            mode: 'insensitive'
                                        }
                                    },
                                    include: { user: true }
                                })];
                        case 2:
                            startup = _c.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Startup not found. Please create the startup first.'
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.startupBudget.findUnique({
                                    where: { startup_id: startup.id }
                                })];
                        case 3:
                            existingBudget = _c.sent();
                            currentTotal = Number((existingBudget === null || existingBudget === void 0 ? void 0 : existingBudget.total_budget) || 0);
                            newTotalBudget = currentTotal + totalBudget;
                            newRemainingBudget = Number((existingBudget === null || existingBudget === void 0 ? void 0 : existingBudget.remaining_budget) || 0) + totalBudget;
                            return [4 /*yield*/, fastify.prisma.startupBudget.upsert({
                                    where: { startup_id: startup.id },
                                    update: {
                                        total_budget: newTotalBudget,
                                        remaining_budget: newRemainingBudget,
                                        updated_at: new Date()
                                    },
                                    create: {
                                        startup_id: startup.id,
                                        total_budget: totalBudget,
                                        used_budget: 0,
                                        remaining_budget: totalBudget
                                    }
                                })];
                        case 4:
                            budget = _c.sent();
                            categoryNames = {
                                cloud: 'Cloud Services',
                                marketing: 'Marketing',
                                it: 'IT Tools',
                                events: 'Events',
                                freelances: 'Freelances',
                                training: 'Training'
                            };
                            _i = 0, _a = Object.entries(categories);
                            _c.label = 5;
                        case 5:
                            if (!(_i < _a.length)) return [3 /*break*/, 9];
                            _b = _a[_i], key = _b[0], amount = _b[1];
                            if (!(amount > 0)) return [3 /*break*/, 8];
                            return [4 /*yield*/, fastify.prisma.budgetCategory.findUnique({
                                    where: {
                                        startup_id_name: {
                                            startup_id: startup.id,
                                            name: categoryNames[key]
                                        }
                                    }
                                })];
                        case 6:
                            existingCategory = _c.sent();
                            currentCategoryBudget = Number((existingCategory === null || existingCategory === void 0 ? void 0 : existingCategory.budget_allocated) || 0);
                            newCategoryBudget = currentCategoryBudget + amount;
                            return [4 /*yield*/, fastify.prisma.budgetCategory.upsert({
                                    where: {
                                        startup_id_name: {
                                            startup_id: startup.id,
                                            name: categoryNames[key]
                                        }
                                    },
                                    update: {
                                        budget_allocated: newCategoryBudget,
                                        updated_at: new Date()
                                    },
                                    create: {
                                        startup_id: startup.id,
                                        name: categoryNames[key],
                                        budget_allocated: amount,
                                        budget_used: 0,
                                        color: getCategoryColor(key)
                                    }
                                })];
                        case 7:
                            _c.sent();
                            _c.label = 8;
                        case 8:
                            _i++;
                            return [3 /*break*/, 5];
                        case 9: return [2 /*return*/, reply.send({
                                success: true,
                                message: 'Budget allocated successfully',
                                data: {
                                    budgetId: budget.id
                                }
                            })];
                        case 10:
                            error_3 = _c.sent();
                            fastify.log.error('Budget allocation error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
            // Get budget overview for startup users
            fastify.get('/budget/user/overview', {
                schema: {
                    tags: ['Budget'],
                    summary: 'Get budget overview for startup user',
                    description: 'Get budget overview for the authenticated startup user',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    }
                },
                preHandler: authenticateUser
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var user, startup, budget, categories, transformedCategories, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            user = request.user;
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: { user_id: user.id }
                                })];
                        case 1:
                            startup = _a.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.send({
                                        success: true,
                                        data: {
                                            totalBudget: 0,
                                            usedBudget: 0,
                                            remainingBudget: 0,
                                            categories: []
                                        }
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.startupBudget.findFirst({
                                    where: { startup_id: startup.id }
                                })];
                        case 2:
                            budget = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetCategory.findMany({
                                    where: { startup_id: startup.id }
                                })];
                        case 3:
                            categories = _a.sent();
                            transformedCategories = categories.map(function (category) { return ({
                                id: category.id,
                                name: category.name,
                                allocated: Number(category.budget_allocated),
                                used: Number(category.budget_used),
                                remaining: Number(category.budget_allocated) - Number(category.budget_used),
                                percentage: Number(category.budget_allocated) > 0
                                    ? Math.round((Number(category.budget_used) / Number(category.budget_allocated)) * 100)
                                    : 0,
                                color: category.color || getCategoryColor(category.name)
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalBudget: Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0),
                                        usedBudget: Number((budget === null || budget === void 0 ? void 0 : budget.used_budget) || 0),
                                        remainingBudget: Number((budget === null || budget === void 0 ? void 0 : budget.remaining_budget) || 0),
                                        categories: transformedCategories
                                    }
                                })];
                        case 4:
                            error_4 = _a.sent();
                            fastify.log.error('User budget overview error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get budget statistics for startup users
            fastify.get('/budget/user/stats', {
                schema: {
                    tags: ['Budget'],
                    summary: 'Get budget statistics for startup user',
                    description: 'Get aggregated budget statistics for the authenticated startup user',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    }
                },
                preHandler: authenticateUser
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var user, startup, budget, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            user = request.user;
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: { user_id: user.id }
                                })];
                        case 1:
                            startup = _a.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.send({
                                        success: true,
                                        data: {
                                            totalAllocated: 0,
                                            totalUsed: 0,
                                            totalRemaining: 0,
                                            budgetUtilization: 0
                                        }
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.startupBudget.findFirst({
                                    where: { startup_id: startup.id }
                                })];
                        case 2:
                            budget = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalAllocated: Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0),
                                        totalUsed: Number((budget === null || budget === void 0 ? void 0 : budget.used_budget) || 0),
                                        totalRemaining: Number((budget === null || budget === void 0 ? void 0 : budget.remaining_budget) || 0),
                                        budgetUtilization: Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0) > 0
                                            ? Math.round((Number((budget === null || budget === void 0 ? void 0 : budget.used_budget) || 0) / Number((budget === null || budget === void 0 ? void 0 : budget.total_budget) || 0)) * 100)
                                            : 0
                                    }
                                })];
                        case 3:
                            error_5 = _a.sent();
                            fastify.log.error('User budget stats error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
// Helper function to get category colors
function getCategoryColor(category) {
    var colors = {
        'Cloud Services': '#3B82F6',
        'Marketing': '#10B981',
        'IT Tools': '#8B5CF6',
        'Events': '#F59E0B',
        'Freelances': '#EF4444',
        'Training': '#06B6D4',
        'Other': '#6B7280'
    };
    return colors[category] || '#6B7280';
}
