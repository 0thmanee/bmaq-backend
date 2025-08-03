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
 * Analytics routes for admin dashboard
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get comprehensive analytics overview
            fastify.get('/analytics/overview', {
                schema: {
                    tags: ['Analytics'],
                    summary: 'Get comprehensive analytics overview',
                    description: 'Get aggregated analytics data for the admin analytics dashboard',
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
                            period: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' }
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
                                        overview: {
                                            type: 'object',
                                            properties: {
                                                totalUsers: { type: 'number' },
                                                totalStartups: { type: 'number' },
                                                totalRevenue: { type: 'number' },
                                                totalFunding: { type: 'number' },
                                                growth: {
                                                    type: 'object',
                                                    properties: {
                                                        users: { type: 'number' },
                                                        startups: { type: 'number' },
                                                        revenue: { type: 'number' },
                                                        funding: { type: 'number' }
                                                    }
                                                }
                                            }
                                        },
                                        userEngagement: {
                                            type: 'object',
                                            properties: {
                                                activeUsers: { type: 'number' },
                                                avgSessionTime: { type: 'string' },
                                                bounceRate: { type: 'string' },
                                                pageViews: { type: 'number' },
                                                logins: { type: 'number' },
                                                questionnairesCompleted: { type: 'number' },
                                                resourcesDownloaded: { type: 'number' }
                                            }
                                        },
                                        startupsData: {
                                            type: 'object',
                                            properties: {
                                                byStage: { type: 'object' },
                                                byIndustry: { type: 'object' }
                                            }
                                        },
                                        budgetAnalytics: {
                                            type: 'object',
                                            properties: {
                                                totalAllocated: { type: 'number' },
                                                totalUsed: { type: 'number' },
                                                utilizationRate: { type: 'number' },
                                                categories: { type: 'array' }
                                            }
                                        },
                                        requestsAnalytics: {
                                            type: 'object',
                                            properties: {
                                                total: { type: 'number' },
                                                approved: { type: 'number' },
                                                pending: { type: 'number' },
                                                rejected: { type: 'number' },
                                                totalAmount: { type: 'number' }
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
                var period, now, startDate, totalUsers, totalStartups, budgetTotals, totalRevenue, totalFunding, previousPeriodStart, previousPeriodEnd, previousUsers, previousStartups, currentUsers, currentStartups, userGrowth, startupGrowth, activeUsers, resourceDownloads, questionnairesCompleted, eventAttendances, startupsByIndustry, industryDistribution_1, stageDistribution, budgetCategories, budgetCategoryAnalytics, totalAllocated, totalUsed, utilizationRate, requestsStats, requestsAnalytics_1, analyticsData, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 15, , 16]);
                            period = request.query.period || '30d';
                            now = new Date();
                            startDate = new Date();
                            switch (period) {
                                case '7d':
                                    startDate.setDate(now.getDate() - 7);
                                    break;
                                case '30d':
                                    startDate.setDate(now.getDate() - 30);
                                    break;
                                case '90d':
                                    startDate.setDate(now.getDate() - 90);
                                    break;
                                case '1y':
                                    startDate.setFullYear(now.getFullYear() - 1);
                                    break;
                            }
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED'
                                    }
                                })];
                        case 1:
                            totalUsers = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startup.count()];
                        case 2:
                            totalStartups = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startupBudget.aggregate({
                                    _sum: {
                                        total_budget: true,
                                        used_budget: true
                                    }
                                })];
                        case 3:
                            budgetTotals = _a.sent();
                            totalRevenue = Number(budgetTotals._sum.used_budget || 0);
                            totalFunding = Number(budgetTotals._sum.total_budget || 0);
                            previousPeriodStart = new Date(startDate);
                            previousPeriodEnd = new Date(startDate);
                            previousPeriodEnd.setTime(startDate.getTime() + (startDate.getTime() - now.getTime()));
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED',
                                        created_at: {
                                            gte: previousPeriodStart,
                                            lte: previousPeriodEnd
                                        }
                                    }
                                })];
                        case 4:
                            previousUsers = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startup.count({
                                    where: {
                                        created_at: {
                                            gte: previousPeriodStart,
                                            lte: previousPeriodEnd
                                        }
                                    }
                                })];
                        case 5:
                            previousStartups = _a.sent();
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED',
                                        created_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 6:
                            currentUsers = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startup.count({
                                    where: {
                                        created_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 7:
                            currentStartups = _a.sent();
                            userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
                            startupGrowth = previousStartups > 0 ? ((currentStartups - previousStartups) / previousStartups) * 100 : 0;
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED',
                                        updated_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 8:
                            activeUsers = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resourceDownload.count({
                                    where: {
                                        downloaded_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 9:
                            resourceDownloads = _a.sent();
                            return [4 /*yield*/, fastify.prisma.suiviResponse.count({
                                    where: {
                                        submitted_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 10:
                            questionnairesCompleted = _a.sent();
                            return [4 /*yield*/, fastify.prisma.eventAttendee.count({
                                    where: {
                                        registered_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 11:
                            eventAttendances = _a.sent();
                            return [4 /*yield*/, fastify.prisma.startup.groupBy({
                                    by: ['industry'],
                                    _count: {
                                        id: true
                                    },
                                    where: {
                                        industry: {
                                            not: null
                                        }
                                    }
                                })];
                        case 12:
                            startupsByIndustry = _a.sent();
                            industryDistribution_1 = {};
                            startupsByIndustry.forEach(function (group) {
                                if (group.industry) {
                                    industryDistribution_1[group.industry] = group._count.id;
                                }
                            });
                            stageDistribution = {
                                'Idea': Math.floor(totalStartups * 0.3),
                                'MVP': Math.floor(totalStartups * 0.4),
                                'Growth': Math.floor(totalStartups * 0.2),
                                'Scaling': Math.floor(totalStartups * 0.1)
                            };
                            return [4 /*yield*/, fastify.prisma.budgetCategory.groupBy({
                                    by: ['name'],
                                    _sum: {
                                        budget_allocated: true,
                                        budget_used: true
                                    }
                                })];
                        case 13:
                            budgetCategories = _a.sent();
                            budgetCategoryAnalytics = budgetCategories.map(function (category) { return ({
                                category: category.name,
                                allocated: Number(category._sum.budget_allocated || 0),
                                used: Number(category._sum.budget_used || 0),
                                remaining: Number(category._sum.budget_allocated || 0) - Number(category._sum.budget_used || 0)
                            }); });
                            totalAllocated = Number(budgetTotals._sum.total_budget || 0);
                            totalUsed = Number(budgetTotals._sum.used_budget || 0);
                            utilizationRate = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;
                            return [4 /*yield*/, fastify.prisma.budgetRequest.groupBy({
                                    by: ['status'],
                                    _count: {
                                        id: true
                                    },
                                    _sum: {
                                        amount: true
                                    }
                                })];
                        case 14:
                            requestsStats = _a.sent();
                            requestsAnalytics_1 = {
                                total: 0,
                                approved: 0,
                                pending: 0,
                                rejected: 0,
                                totalAmount: 0
                            };
                            requestsStats.forEach(function (stat) {
                                requestsAnalytics_1.total += stat._count.id;
                                requestsAnalytics_1.totalAmount += Number(stat._sum.amount || 0);
                                switch (stat.status) {
                                    case 'APPROVED':
                                        requestsAnalytics_1.approved = stat._count.id;
                                        break;
                                    case 'PENDING':
                                        requestsAnalytics_1.pending = stat._count.id;
                                        break;
                                    case 'REJECTED':
                                        requestsAnalytics_1.rejected = stat._count.id;
                                        break;
                                }
                            });
                            analyticsData = {
                                overview: {
                                    totalUsers: totalUsers,
                                    totalStartups: totalStartups,
                                    totalRevenue: totalRevenue,
                                    totalFunding: totalFunding,
                                    growth: {
                                        users: Math.round(userGrowth * 10) / 10,
                                        startups: Math.round(startupGrowth * 10) / 10,
                                        revenue: 25.7, // Mock data for now
                                        funding: 15.2 // Mock data for now
                                    }
                                },
                                userEngagement: {
                                    activeUsers: activeUsers,
                                    avgSessionTime: '24m 33s', // Mock data
                                    bounceRate: '18.5%', // Mock data
                                    pageViews: 1547, // Mock data
                                    logins: eventAttendances,
                                    questionnairesCompleted: questionnairesCompleted,
                                    resourcesDownloaded: resourceDownloads
                                },
                                startupsData: {
                                    byStage: stageDistribution,
                                    byIndustry: industryDistribution_1
                                },
                                budgetAnalytics: {
                                    totalAllocated: totalAllocated,
                                    totalUsed: totalUsed,
                                    utilizationRate: utilizationRate,
                                    categories: budgetCategoryAnalytics
                                },
                                requestsAnalytics: requestsAnalytics_1
                            };
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: analyticsData
                                })];
                        case 15:
                            error_1 = _a.sent();
                            fastify.log.error('Analytics overview error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 16: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
