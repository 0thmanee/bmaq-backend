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
// Authentication middleware for regular users
async function authenticateUser(request, reply) {
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
 * Requests management routes
 */
module.exports = async function (fastify) {
    // Get requests list with filtering
    fastify.get('/requests/list', {
        schema: {
            tags: ['Requests'],
            summary: 'Get budget requests list',
            description: 'Get paginated and filtered list of budget requests',
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
                    status: { type: 'string', default: 'all' },
                    category: { type: 'string', default: 'all' },
                    search: { type: 'string', default: '' },
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
                                    id: { type: 'number' },
                                    startup: { type: 'string' },
                                    founder: { type: 'string' },
                                    category: { type: 'string' },
                                    description: { type: 'string' },
                                    amount: { type: 'number' },
                                    status: { type: 'string' },
                                    priority: { type: 'string' },
                                    submissionDate: { type: 'string' },
                                    reviewDate: { type: 'string' },
                                    reviewedBy: { type: 'string' },
                                    attachments: { type: 'array', items: { type: 'string' } },
                                    notes: { type: 'string' }
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
            const { status = 'all', category = 'all', search = '', limit = 50 } = request.query;
            // Build where clause for filtering
            const whereClause = {};
            if (status !== 'all') {
                whereClause.status = status.toUpperCase();
            }
            if (category !== 'all') {
                whereClause.category = { contains: category, mode: 'insensitive' };
            }
            if (search) {
                whereClause.OR = [
                    { description: { contains: search, mode: 'insensitive' } },
                    { startup: { company_name: { contains: search, mode: 'insensitive' } } },
                    { user: { name: { contains: search, mode: 'insensitive' } } }
                ];
            }
            // Get requests from database
            const requests = await fastify.prisma.budgetRequest.findMany({
                where: whereClause,
                include: {
                    startup: {
                        select: {
                            company_name: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    },
                    attachments: true
                },
                orderBy: {
                    submission_date: 'desc'
                },
                take: limit
            });
            // Transform data to match frontend expectations
            const transformedRequests = requests.map((request, index) => ({
                id: index + 1, // Frontend expects numeric ID
                startup: request.startup.company_name,
                founder: request.user.name || 'Unknown',
                category: request.category,
                description: request.description,
                amount: Number(request.amount),
                status: request.status.toLowerCase(),
                priority: request.priority.toLowerCase(),
                submissionDate: request.submission_date.toISOString(),
                reviewDate: request.review_date?.toISOString(),
                reviewedBy: request.reviewed_by ? 'Admin' : undefined,
                attachments: request.attachments.map(att => att.file_name),
                notes: request.notes || undefined
            }));
            return reply.send({
                success: true,
                data: transformedRequests
            });
        }
        catch (error) {
            fastify.log.error('Requests list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get requests statistics
    fastify.get('/requests/stats', {
        schema: {
            tags: ['Requests'],
            summary: 'Get requests statistics',
            description: 'Get aggregated statistics for budget requests',
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
                                pending: { type: 'number' },
                                underReview: { type: 'number' },
                                approved: { type: 'number' },
                                rejected: { type: 'number' },
                                totalAmount: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: authenticateAdmin
    }, async (request, reply) => {
        try {
            // Get request counts by status
            const pending = await fastify.prisma.budgetRequest.count({
                where: { status: 'PENDING' }
            });
            const approved = await fastify.prisma.budgetRequest.count({
                where: { status: 'APPROVED' }
            });
            const rejected = await fastify.prisma.budgetRequest.count({
                where: { status: 'REJECTED' }
            });
            // Get total amount
            const amountStats = await fastify.prisma.budgetRequest.aggregate({
                _sum: {
                    amount: true
                }
            });
            const totalAmount = Number(amountStats._sum.amount || 0);
            const underReview = 0; // No "under review" status in our schema
            return reply.send({
                success: true,
                data: {
                    pending,
                    underReview,
                    approved,
                    rejected,
                    totalAmount
                }
            });
        }
        catch (error) {
            fastify.log.error('Requests stats error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Process request decision (approve/reject)
    fastify.post('/requests/:id/decision', {
        schema: {
            tags: ['Requests'],
            summary: 'Process request decision',
            description: 'Approve or reject a budget request',
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
                required: ['action', 'reason'],
                properties: {
                    action: { type: 'string', enum: ['approve', 'reject'] },
                    reason: { type: 'string' },
                    comments: { type: 'string' }
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
    }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { action, reason, comments } = request.body;
            const user = request.user;
            // Validate action
            if (!['approve', 'reject'].includes(action)) {
                return reply.code(400).send({
                    success: false,
                    message: 'Invalid action. Must be "approve" or "reject"'
                });
            }
            // Find the request by ID (we need to find by actual DB ID, not frontend ID)
            // Since frontend uses sequential IDs, we need to get the nth request
            const requests = await fastify.prisma.budgetRequest.findMany({
                orderBy: {
                    submission_date: 'desc'
                },
                take: 100 // Get enough to find the right one
            });
            const requestIndex = parseInt(id) - 1;
            if (requestIndex < 0 || requestIndex >= requests.length) {
                return reply.code(404).send({
                    success: false,
                    message: 'Request not found'
                });
            }
            const targetRequest = requests[requestIndex];
            // Update request status
            const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
            const notes = `${reason}${comments ? '. ' + comments : ''}`;
            await fastify.prisma.budgetRequest.update({
                where: { id: targetRequest.id },
                data: {
                    status: newStatus,
                    review_date: new Date(),
                    reviewed_by: user.id,
                    notes,
                    updated_at: new Date()
                }
            });
            return reply.send({
                success: true,
                message: `Request ${action}d successfully`
            });
        }
        catch (error) {
            fastify.log.error('Request decision error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get requests list for startup users (their own requests only)
    fastify.get('/requests/user/list', {
        schema: {
            tags: ['Requests'],
            summary: 'Get budget requests for startup user',
            description: 'Get paginated list of budget requests for the authenticated startup user',
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
                    status: { type: 'string', default: 'all' },
                    category: { type: 'string', default: 'all' },
                    limit: { type: 'number', default: 50 }
                }
            }
        },
        preHandler: authenticateUser
    }, async (request, reply) => {
        try {
            const { status = 'all', category = 'all', limit = 50 } = request.query;
            const user = request.user;
            // Get user's startup
            const startup = await fastify.prisma.startup.findFirst({
                where: { user_id: user.id }
            });
            if (!startup) {
                return reply.send({
                    success: true,
                    data: []
                });
            }
            // Build where clause for filtering
            const whereClause = {
                startup_id: startup.id
            };
            if (status !== 'all') {
                whereClause.status = status.toUpperCase();
            }
            if (category !== 'all') {
                whereClause.category = { contains: category, mode: 'insensitive' };
            }
            // Get requests
            const requests = await fastify.prisma.budgetRequest.findMany({
                where: whereClause,
                include: {
                    startup: {
                        select: {
                            company_name: true
                        }
                    },
                    user: {
                        select: {
                            name: true
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                take: limit
            });
            // Transform data to match frontend expectations
            const transformedRequests = requests.map((request) => ({
                id: request.id,
                title: request.description,
                description: request.description,
                amount: Number(request.amount),
                category: request.category,
                status: capitalizeFirst(request.status),
                priority: capitalizeFirst(request.priority),
                submissionDate: request.submission_date?.toISOString().split('T')[0] || request.created_at.toISOString().split('T')[0],
                reviewDate: request.review_date?.toISOString().split('T')[0] || null,
                reviewed: !!request.reviewed_by,
                reviewedBy: request.reviewed_by || null,
                attachments: [], // Add attachments if available
                notes: request.notes || ''
            }));
            return reply.send({
                success: true,
                data: transformedRequests
            });
        }
        catch (error) {
            fastify.log.error('User requests list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get requests statistics for startup users
    fastify.get('/requests/user/stats', {
        schema: {
            tags: ['Requests'],
            summary: 'Get budget requests statistics for startup user',
            description: 'Get aggregated statistics for the authenticated startup user requests',
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' }
                }
            }
        },
        preHandler: authenticateUser
    }, async (request, reply) => {
        try {
            const user = request.user;
            // Get user's startup
            const startup = await fastify.prisma.startup.findFirst({
                where: { user_id: user.id }
            });
            if (!startup) {
                return reply.send({
                    success: true,
                    data: {
                        pending: 0,
                        underReview: 0,
                        approved: 0,
                        rejected: 0,
                        totalAmount: 0
                    }
                });
            }
            // Get request counts by status
            const pending = await fastify.prisma.budgetRequest.count({
                where: {
                    startup_id: startup.id,
                    status: 'PENDING'
                }
            });
            const approved = await fastify.prisma.budgetRequest.count({
                where: {
                    startup_id: startup.id,
                    status: 'APPROVED'
                }
            });
            const rejected = await fastify.prisma.budgetRequest.count({
                where: {
                    startup_id: startup.id,
                    status: 'REJECTED'
                }
            });
            const underReview = await fastify.prisma.budgetRequest.count({
                where: {
                    startup_id: startup.id,
                    status: 'PENDING' // Using PENDING as UNDER_REVIEW might not exist
                }
            });
            // Get total amount requested
            const totalAmountResult = await fastify.prisma.budgetRequest.aggregate({
                where: {
                    startup_id: startup.id
                },
                _sum: {
                    amount: true
                }
            });
            const totalAmount = Number(totalAmountResult._sum.amount || 0);
            return reply.send({
                success: true,
                data: {
                    pending,
                    underReview,
                    approved,
                    rejected,
                    totalAmount
                }
            });
        }
        catch (error) {
            fastify.log.error('User requests stats error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Create budget request for startup users
    fastify.post('/requests/user/create', {
        schema: {
            tags: ['Requests'],
            summary: 'Create budget request for startup user',
            description: 'Create a new budget request for the authenticated startup user',
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['category', 'description', 'amount', 'priority'],
                properties: {
                    category: { type: 'string' },
                    description: { type: 'string' },
                    amount: { type: 'number' },
                    priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
                }
            }
        },
        preHandler: authenticateUser
    }, async (request, reply) => {
        try {
            const user = request.user;
            const { category, description, amount, priority } = request.body;
            // Get user's startup
            const startup = await fastify.prisma.startup.findFirst({
                where: { user_id: user.id }
            });
            if (!startup) {
                return reply.code(400).send({
                    success: false,
                    message: 'Startup not found'
                });
            }
            // Create budget request
            const budgetRequest = await fastify.prisma.budgetRequest.create({
                data: {
                    startup_id: startup.id,
                    user_id: user.id,
                    category,
                    description,
                    amount,
                    priority,
                    status: 'PENDING',
                    submission_date: new Date(),
                    created_at: new Date(),
                    updated_at: new Date()
                }
            });
            return reply.send({
                success: true,
                data: budgetRequest,
                message: 'Budget request created successfully'
            });
        }
        catch (error) {
            fastify.log.error('Create user request error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
};
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
//# sourceMappingURL=requests.js.map