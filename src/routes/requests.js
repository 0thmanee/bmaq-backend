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
 * Requests management routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, status_1, _c, category, _d, search, _e, limit, whereClause, requests, transformedRequests, error_1;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 3]);
                            _a = request.query, _b = _a.status, status_1 = _b === void 0 ? 'all' : _b, _c = _a.category, category = _c === void 0 ? 'all' : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.limit, limit = _e === void 0 ? 50 : _e;
                            whereClause = {};
                            if (status_1 !== 'all') {
                                whereClause.status = status_1.toUpperCase();
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
                            return [4 /*yield*/, fastify.prisma.budgetRequest.findMany({
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
                                })];
                        case 1:
                            requests = _f.sent();
                            transformedRequests = requests.map(function (request, index) {
                                var _a;
                                return ({
                                    id: index + 1, // Frontend expects numeric ID
                                    startup: request.startup.company_name,
                                    founder: request.user.name || 'Unknown',
                                    category: request.category,
                                    description: request.description,
                                    amount: Number(request.amount),
                                    status: request.status.toLowerCase(),
                                    priority: request.priority.toLowerCase(),
                                    submissionDate: request.submission_date.toISOString(),
                                    reviewDate: (_a = request.review_date) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                    reviewedBy: request.reviewed_by ? 'Admin' : undefined,
                                    attachments: request.attachments.map(function (att) { return att.file_name; }),
                                    notes: request.notes || undefined
                                });
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedRequests
                                })];
                        case 2:
                            error_1 = _f.sent();
                            fastify.log.error('Requests list error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var pending, approved, rejected, amountStats, totalAmount, underReview, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: { status: 'PENDING' }
                                })];
                        case 1:
                            pending = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: { status: 'APPROVED' }
                                })];
                        case 2:
                            approved = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: { status: 'REJECTED' }
                                })];
                        case 3:
                            rejected = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.aggregate({
                                    _sum: {
                                        amount: true
                                    }
                                })];
                        case 4:
                            amountStats = _a.sent();
                            totalAmount = Number(amountStats._sum.amount || 0);
                            underReview = 0;
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        pending: pending,
                                        underReview: underReview,
                                        approved: approved,
                                        rejected: rejected,
                                        totalAmount: totalAmount
                                    }
                                })];
                        case 5:
                            error_2 = _a.sent();
                            fastify.log.error('Requests stats error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, _a, action, reason, comments, user, requests, requestIndex, targetRequest, newStatus, notes, error_3;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            id = request.params.id;
                            _a = request.body, action = _a.action, reason = _a.reason, comments = _a.comments;
                            user = request.user;
                            // Validate action
                            if (!['approve', 'reject'].includes(action)) {
                                return [2 /*return*/, reply.code(400).send({
                                        success: false,
                                        message: 'Invalid action. Must be "approve" or "reject"'
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.budgetRequest.findMany({
                                    orderBy: {
                                        submission_date: 'desc'
                                    },
                                    take: 100 // Get enough to find the right one
                                })];
                        case 1:
                            requests = _b.sent();
                            requestIndex = parseInt(id) - 1;
                            if (requestIndex < 0 || requestIndex >= requests.length) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Request not found'
                                    })];
                            }
                            targetRequest = requests[requestIndex];
                            newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
                            notes = "".concat(reason).concat(comments ? '. ' + comments : '');
                            return [4 /*yield*/, fastify.prisma.budgetRequest.update({
                                    where: { id: targetRequest.id },
                                    data: {
                                        status: newStatus,
                                        review_date: new Date(),
                                        reviewed_by: user.id,
                                        notes: notes,
                                        updated_at: new Date()
                                    }
                                })];
                        case 2:
                            _b.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: "Request ".concat(action, "d successfully")
                                })];
                        case 3:
                            error_3 = _b.sent();
                            fastify.log.error('Request decision error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, status_2, _c, category, _d, limit, user, startup, whereClause, requests, transformedRequests, error_4;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 3, , 4]);
                            _a = request.query, _b = _a.status, status_2 = _b === void 0 ? 'all' : _b, _c = _a.category, category = _c === void 0 ? 'all' : _c, _d = _a.limit, limit = _d === void 0 ? 50 : _d;
                            user = request.user;
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: { user_id: user.id }
                                })];
                        case 1:
                            startup = _e.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.send({
                                        success: true,
                                        data: []
                                    })];
                            }
                            whereClause = {
                                startup_id: startup.id
                            };
                            if (status_2 !== 'all') {
                                whereClause.status = status_2.toUpperCase();
                            }
                            if (category !== 'all') {
                                whereClause.category = { contains: category, mode: 'insensitive' };
                            }
                            return [4 /*yield*/, fastify.prisma.budgetRequest.findMany({
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
                                })];
                        case 2:
                            requests = _e.sent();
                            transformedRequests = requests.map(function (request) {
                                var _a, _b;
                                return ({
                                    id: request.id,
                                    title: request.description,
                                    description: request.description,
                                    amount: Number(request.amount),
                                    category: request.category,
                                    status: capitalizeFirst(request.status),
                                    priority: capitalizeFirst(request.priority),
                                    submissionDate: ((_a = request.submission_date) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0]) || request.created_at.toISOString().split('T')[0],
                                    reviewDate: ((_b = request.review_date) === null || _b === void 0 ? void 0 : _b.toISOString().split('T')[0]) || null,
                                    reviewed: !!request.reviewed_by,
                                    reviewedBy: request.reviewed_by || null,
                                    attachments: [], // Add attachments if available
                                    notes: request.notes || ''
                                });
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedRequests
                                })];
                        case 3:
                            error_4 = _e.sent();
                            fastify.log.error('User requests list error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var user, startup, pending, approved, rejected, underReview, totalAmountResult, totalAmount, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 7, , 8]);
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
                                            pending: 0,
                                            underReview: 0,
                                            approved: 0,
                                            rejected: 0,
                                            totalAmount: 0
                                        }
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: {
                                        startup_id: startup.id,
                                        status: 'PENDING'
                                    }
                                })];
                        case 2:
                            pending = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: {
                                        startup_id: startup.id,
                                        status: 'APPROVED'
                                    }
                                })];
                        case 3:
                            approved = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: {
                                        startup_id: startup.id,
                                        status: 'REJECTED'
                                    }
                                })];
                        case 4:
                            rejected = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.count({
                                    where: {
                                        startup_id: startup.id,
                                        status: 'PENDING' // Using PENDING as UNDER_REVIEW might not exist
                                    }
                                })];
                        case 5:
                            underReview = _a.sent();
                            return [4 /*yield*/, fastify.prisma.budgetRequest.aggregate({
                                    where: {
                                        startup_id: startup.id
                                    },
                                    _sum: {
                                        amount: true
                                    }
                                })];
                        case 6:
                            totalAmountResult = _a.sent();
                            totalAmount = Number(totalAmountResult._sum.amount || 0);
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        pending: pending,
                                        underReview: underReview,
                                        approved: approved,
                                        rejected: rejected,
                                        totalAmount: totalAmount
                                    }
                                })];
                        case 7:
                            error_5 = _a.sent();
                            fastify.log.error('User requests stats error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var user, _a, category, description, amount, priority, startup, budgetRequest, error_6;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 3, , 4]);
                            user = request.user;
                            _a = request.body, category = _a.category, description = _a.description, amount = _a.amount, priority = _a.priority;
                            return [4 /*yield*/, fastify.prisma.startup.findFirst({
                                    where: { user_id: user.id }
                                })];
                        case 1:
                            startup = _b.sent();
                            if (!startup) {
                                return [2 /*return*/, reply.code(400).send({
                                        success: false,
                                        message: 'Startup not found'
                                    })];
                            }
                            return [4 /*yield*/, fastify.prisma.budgetRequest.create({
                                    data: {
                                        startup_id: startup.id,
                                        user_id: user.id,
                                        category: category,
                                        description: description,
                                        amount: amount,
                                        priority: priority,
                                        status: 'PENDING',
                                        submission_date: new Date(),
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                })];
                        case 2:
                            budgetRequest = _b.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: budgetRequest,
                                    message: 'Budget request created successfully'
                                })];
                        case 3:
                            error_6 = _b.sent();
                            fastify.log.error('Create user request error:', error_6);
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
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
