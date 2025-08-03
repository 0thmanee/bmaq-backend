"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
// Authentication middleware
async function authenticateAdmin(request, reply) {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                success: false,
                message: 'No token provided'
            });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if user is admin
        if (decoded.role !== 'ADMIN') {
            return reply.code(403).send({
                success: false,
                message: 'Admin access required'
            });
        }
        // Add user info to request
        request.user = decoded;
    }
    catch (error) {
        return reply.code(401).send({
            success: false,
            message: 'Invalid token'
        });
    }
}
/**
 * Analytics routes for admin dashboard
 */
module.exports = async function (fastify) {
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
    }, async (request, reply) => {
        try {
            const period = request.query.period || '30d';
            // Calculate date range based on period
            const now = new Date();
            const startDate = new Date();
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
            // Get total users
            const totalUsers = await fastify.prisma.user.count({
                where: {
                    role: 'STARTUP',
                    status: 'APPROVED'
                }
            });
            // Get total startups
            const totalStartups = await fastify.prisma.startup.count();
            // Get budget totals for revenue calculation
            const budgetTotals = await fastify.prisma.startupBudget.aggregate({
                _sum: {
                    total_budget: true,
                    used_budget: true
                }
            });
            const totalRevenue = Number(budgetTotals._sum.used_budget || 0);
            const totalFunding = Number(budgetTotals._sum.total_budget || 0);
            // Calculate growth metrics (simplified - comparing to previous period)
            const previousPeriodStart = new Date(startDate);
            const previousPeriodEnd = new Date(startDate);
            previousPeriodEnd.setTime(startDate.getTime() + (startDate.getTime() - now.getTime()));
            const previousUsers = await fastify.prisma.user.count({
                where: {
                    role: 'STARTUP',
                    status: 'APPROVED',
                    created_at: {
                        gte: previousPeriodStart,
                        lte: previousPeriodEnd
                    }
                }
            });
            const previousStartups = await fastify.prisma.startup.count({
                where: {
                    created_at: {
                        gte: previousPeriodStart,
                        lte: previousPeriodEnd
                    }
                }
            });
            const currentUsers = await fastify.prisma.user.count({
                where: {
                    role: 'STARTUP',
                    status: 'APPROVED',
                    created_at: {
                        gte: startDate
                    }
                }
            });
            const currentStartups = await fastify.prisma.startup.count({
                where: {
                    created_at: {
                        gte: startDate
                    }
                }
            });
            // Calculate growth percentages
            const userGrowth = previousUsers > 0 ? ((currentUsers - previousUsers) / previousUsers) * 100 : 0;
            const startupGrowth = previousStartups > 0 ? ((currentStartups - previousStartups) / previousStartups) * 100 : 0;
            // Get user engagement metrics
            const activeUsers = await fastify.prisma.user.count({
                where: {
                    role: 'STARTUP',
                    status: 'APPROVED',
                    updated_at: {
                        gte: startDate
                    }
                }
            });
            const resourceDownloads = await fastify.prisma.resourceDownload.count({
                where: {
                    downloaded_at: {
                        gte: startDate
                    }
                }
            });
            const questionnairesCompleted = await fastify.prisma.suiviResponse.count({
                where: {
                    submitted_at: {
                        gte: startDate
                    }
                }
            });
            const eventAttendances = await fastify.prisma.eventAttendee.count({
                where: {
                    registered_at: {
                        gte: startDate
                    }
                }
            });
            // Get startup distribution by industry
            const startupsByIndustry = await fastify.prisma.startup.groupBy({
                by: ['industry'],
                _count: {
                    id: true
                },
                where: {
                    industry: {
                        not: null
                    }
                }
            });
            const industryDistribution = {};
            startupsByIndustry.forEach(group => {
                if (group.industry) {
                    industryDistribution[group.industry] = group._count.id;
                }
            });
            // Mock stage distribution (since we don't have stage in schema)
            const stageDistribution = {
                'Idea': Math.floor(totalStartups * 0.3),
                'MVP': Math.floor(totalStartups * 0.4),
                'Growth': Math.floor(totalStartups * 0.2),
                'Scaling': Math.floor(totalStartups * 0.1)
            };
            // Get budget analytics
            const budgetCategories = await fastify.prisma.budgetCategory.groupBy({
                by: ['name'],
                _sum: {
                    budget_allocated: true,
                    budget_used: true
                }
            });
            const budgetCategoryAnalytics = budgetCategories.map(category => ({
                category: category.name,
                allocated: Number(category._sum.budget_allocated || 0),
                used: Number(category._sum.budget_used || 0),
                remaining: Number(category._sum.budget_allocated || 0) - Number(category._sum.budget_used || 0)
            }));
            const totalAllocated = Number(budgetTotals._sum.total_budget || 0);
            const totalUsed = Number(budgetTotals._sum.used_budget || 0);
            const utilizationRate = totalAllocated > 0 ? Math.round((totalUsed / totalAllocated) * 100) : 0;
            // Get requests analytics
            const requestsStats = await fastify.prisma.budgetRequest.groupBy({
                by: ['status'],
                _count: {
                    id: true
                },
                _sum: {
                    amount: true
                }
            });
            let requestsAnalytics = {
                total: 0,
                approved: 0,
                pending: 0,
                rejected: 0,
                totalAmount: 0
            };
            requestsStats.forEach(stat => {
                requestsAnalytics.total += stat._count.id;
                requestsAnalytics.totalAmount += Number(stat._sum.amount || 0);
                switch (stat.status) {
                    case 'APPROVED':
                        requestsAnalytics.approved = stat._count.id;
                        break;
                    case 'PENDING':
                        requestsAnalytics.pending = stat._count.id;
                        break;
                    case 'REJECTED':
                        requestsAnalytics.rejected = stat._count.id;
                        break;
                }
            });
            // Prepare response
            const analyticsData = {
                overview: {
                    totalUsers,
                    totalStartups,
                    totalRevenue,
                    totalFunding,
                    growth: {
                        users: Math.round(userGrowth * 10) / 10,
                        startups: Math.round(startupGrowth * 10) / 10,
                        revenue: 25.7, // Mock data for now
                        funding: 15.2 // Mock data for now
                    }
                },
                userEngagement: {
                    activeUsers,
                    avgSessionTime: '24m 33s', // Mock data
                    bounceRate: '18.5%', // Mock data
                    pageViews: 1547, // Mock data
                    logins: eventAttendances,
                    questionnairesCompleted,
                    resourcesDownloaded: resourceDownloads
                },
                startupsData: {
                    byStage: stageDistribution,
                    byIndustry: industryDistribution
                },
                budgetAnalytics: {
                    totalAllocated,
                    totalUsed,
                    utilizationRate,
                    categories: budgetCategoryAnalytics
                },
                requestsAnalytics
            };
            return reply.send({
                success: true,
                data: analyticsData
            });
        }
        catch (error) {
            fastify.log.error('Analytics overview error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
};
//# sourceMappingURL=analytics.js.map