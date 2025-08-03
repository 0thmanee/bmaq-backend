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
 * Suivi (Follow-up) routes for admin dashboard
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get all suivi forms
            fastify.get('/suivi/forms', {
                schema: {
                    tags: ['Suivi'],
                    summary: 'Get all suivi forms',
                    description: 'Get all follow-up forms with their statistics',
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
                                data: { type: 'array' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var suiviForms, totalStartups_1, formsWithStats, error_1;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            return [4 /*yield*/, fastify.prisma.suiviForm.findMany({
                                    include: {
                                        _count: {
                                            select: {
                                                responses: true,
                                                questions: true
                                            }
                                        },
                                        questions: {
                                            orderBy: {
                                                order_index: 'asc'
                                            }
                                        }
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    }
                                })];
                        case 1:
                            suiviForms = _a.sent();
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED'
                                    }
                                })];
                        case 2:
                            totalStartups_1 = _a.sent();
                            return [4 /*yield*/, Promise.all(suiviForms.map(function (form) { return __awaiter(_this, void 0, void 0, function () {
                                    var uniqueResponses, responseCount, responseRate, lastSent, nextScheduled;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fastify.prisma.suiviResponse.groupBy({
                                                    by: ['user_id'],
                                                    where: {
                                                        form_id: form.id
                                                    },
                                                    _count: {
                                                        id: true
                                                    }
                                                })];
                                            case 1:
                                                uniqueResponses = _a.sent();
                                                responseCount = uniqueResponses.length;
                                                responseRate = totalStartups_1 > 0 ? Math.round((responseCount / totalStartups_1) * 100) : 0;
                                                lastSent = form.created_at;
                                                nextScheduled = new Date(lastSent);
                                                switch (form.frequency) {
                                                    case 'WEEKLY':
                                                        nextScheduled.setDate(nextScheduled.getDate() + 7);
                                                        break;
                                                    case 'MONTHLY':
                                                        nextScheduled.setMonth(nextScheduled.getMonth() + 1);
                                                        break;
                                                    case 'QUARTERLY':
                                                        nextScheduled.setMonth(nextScheduled.getMonth() + 3);
                                                        break;
                                                    case 'INSTANT':
                                                        nextScheduled.setDate(nextScheduled.getDate() + 1);
                                                        break;
                                                }
                                                return [2 /*return*/, {
                                                        id: form.id,
                                                        title: form.title,
                                                        description: form.description,
                                                        status: form.status.toLowerCase(),
                                                        frequency: form.frequency.toLowerCase(),
                                                        totalQuestions: form._count.questions,
                                                        responses: responseCount,
                                                        totalStartups: totalStartups_1,
                                                        responseRate: responseRate,
                                                        nextScheduled: nextScheduled.toISOString().split('T')[0],
                                                        createdAt: form.created_at.toISOString().split('T')[0],
                                                        lastSent: lastSent.toISOString().split('T')[0],
                                                        categories: [] // Empty array for now as we don't have categories in the schema
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 3:
                            formsWithStats = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: formsWithStats
                                })];
                        case 4:
                            error_1 = _a.sent();
                            fastify.log.error('Suivi forms error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get suivi analytics
            fastify.get('/suivi/analytics', {
                schema: {
                    tags: ['Suivi'],
                    summary: 'Get suivi analytics',
                    description: 'Get analytics data for suivi forms and responses',
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
                                data: { type: 'object' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var period_1, now, startDate, totalForms, activeForms, totalResponses, totalStartups, responseRate, responsesByForm, formResponseData, responseTrends, trendsData, completionByStartup, avgCompletionRate, analyticsData, error_2;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 9, , 10]);
                            period_1 = request.query.period || '30d';
                            now = new Date();
                            startDate = new Date();
                            switch (period_1) {
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
                            return [4 /*yield*/, fastify.prisma.suiviForm.count()];
                        case 1:
                            totalForms = _a.sent();
                            return [4 /*yield*/, fastify.prisma.suiviForm.count({
                                    where: {
                                        status: 'ACTIVE'
                                    }
                                })];
                        case 2:
                            activeForms = _a.sent();
                            return [4 /*yield*/, fastify.prisma.suiviResponse.count({
                                    where: {
                                        submitted_at: {
                                            gte: startDate
                                        }
                                    }
                                })];
                        case 3:
                            totalResponses = _a.sent();
                            return [4 /*yield*/, fastify.prisma.user.count({
                                    where: {
                                        role: 'STARTUP',
                                        status: 'APPROVED'
                                    }
                                })];
                        case 4:
                            totalStartups = _a.sent();
                            responseRate = totalStartups > 0 && activeForms > 0 ?
                                Math.round((totalResponses / (totalStartups * activeForms)) * 100) : 0;
                            return [4 /*yield*/, fastify.prisma.suiviResponse.groupBy({
                                    by: ['form_id'],
                                    where: {
                                        submitted_at: {
                                            gte: startDate
                                        }
                                    },
                                    _count: {
                                        id: true
                                    }
                                })];
                        case 5:
                            responsesByForm = _a.sent();
                            return [4 /*yield*/, Promise.all(responsesByForm.map(function (response) { return __awaiter(_this, void 0, void 0, function () {
                                    var form;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, fastify.prisma.suiviForm.findUnique({
                                                    where: { id: response.form_id }
                                                })];
                                            case 1:
                                                form = _a.sent();
                                                return [2 /*return*/, {
                                                        formTitle: (form === null || form === void 0 ? void 0 : form.title) || 'Unknown Form',
                                                        responses: response._count.id,
                                                        formId: response.form_id
                                                    }];
                                        }
                                    });
                                }); }))];
                        case 6:
                            formResponseData = _a.sent();
                            return [4 /*yield*/, fastify.prisma.suiviResponse.groupBy({
                                    by: ['submitted_at'],
                                    where: {
                                        submitted_at: {
                                            gte: startDate
                                        }
                                    },
                                    _count: {
                                        id: true
                                    },
                                    orderBy: {
                                        submitted_at: 'asc'
                                    }
                                })];
                        case 7:
                            responseTrends = _a.sent();
                            trendsData = responseTrends.reduce(function (acc, item) {
                                var date = new Date(item.submitted_at);
                                var key;
                                if (period_1 === '7d') {
                                    key = date.toISOString().split('T')[0]; // Daily
                                }
                                else if (period_1 === '30d') {
                                    key = date.toISOString().split('T')[0]; // Daily
                                }
                                else {
                                    key = "".concat(date.getFullYear(), "-").concat(String(date.getMonth() + 1).padStart(2, '0')); // Monthly
                                }
                                acc[key] = (acc[key] || 0) + item._count.id;
                                return acc;
                            }, {});
                            return [4 /*yield*/, fastify.prisma.suiviResponse.groupBy({
                                    by: ['user_id'],
                                    where: {
                                        submitted_at: {
                                            gte: startDate
                                        }
                                    },
                                    _count: {
                                        id: true
                                    }
                                })];
                        case 8:
                            completionByStartup = _a.sent();
                            avgCompletionRate = completionByStartup.length > 0 ?
                                Math.round(completionByStartup.reduce(function (sum, item) { return sum + item._count.id; }, 0) / completionByStartup.length) : 0;
                            analyticsData = {
                                overview: {
                                    totalForms: totalForms,
                                    activeForms: activeForms,
                                    totalResponses: totalResponses,
                                    responseRate: responseRate,
                                    avgCompletionRate: avgCompletionRate,
                                    totalStartups: totalStartups
                                },
                                responsesByForm: formResponseData,
                                trends: trendsData,
                                completionStats: {
                                    highPerformers: completionByStartup.filter(function (item) { return item._count.id >= 3; }).length,
                                    regularUsers: completionByStartup.filter(function (item) { return item._count.id >= 1 && item._count.id < 3; }).length,
                                    inactiveUsers: totalStartups - completionByStartup.length
                                }
                            };
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: analyticsData
                                })];
                        case 9:
                            error_2 = _a.sent();
                            fastify.log.error('Suivi analytics error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 10: return [2 /*return*/];
                    }
                });
            }); });
            // Create a new suivi form
            fastify.post('/suivi/forms', {
                schema: {
                    tags: ['Suivi'],
                    summary: 'Create a new suivi form',
                    description: 'Create a new follow-up form',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['title', 'description', 'frequency', 'questions'],
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            frequency: { type: 'string', enum: ['weekly', 'monthly', 'quarterly', 'yearly'] },
                            questions: { type: 'array' },
                            categories: { type: 'array' }
                        }
                    },
                    response: {
                        201: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, title, description, frequency, questions, frequencyMap, dbFrequency, newForm, i, question, typeMap, dbType, completeForm, error_3;
                var _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _c.trys.push([0, 7, , 8]);
                            _a = request.body, title = _a.title, description = _a.description, frequency = _a.frequency, questions = _a.questions;
                            frequencyMap = {
                                'weekly': 'WEEKLY',
                                'monthly': 'MONTHLY',
                                'quarterly': 'QUARTERLY',
                                'yearly': 'QUARTERLY', // Map yearly to quarterly for now
                                'instant': 'INSTANT'
                            };
                            dbFrequency = frequencyMap[frequency.toLowerCase()] || 'MONTHLY';
                            return [4 /*yield*/, fastify.prisma.suiviForm.create({
                                    data: {
                                        title: title,
                                        description: description,
                                        frequency: dbFrequency,
                                        status: 'ACTIVE',
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                })];
                        case 1:
                            newForm = _c.sent();
                            if (!(questions && questions.length > 0)) return [3 /*break*/, 5];
                            i = 0;
                            _c.label = 2;
                        case 2:
                            if (!(i < questions.length)) return [3 /*break*/, 5];
                            question = questions[i];
                            typeMap = {
                                'text': 'TEXT',
                                'textarea': 'TEXTAREA',
                                'select': 'SELECT',
                                'multiselect': 'MULTISELECT',
                                'number': 'NUMBER',
                                'rating': 'RATING',
                                'checkbox': 'CHECKBOX'
                            };
                            dbType = typeMap[(_b = question.type) === null || _b === void 0 ? void 0 : _b.toLowerCase()] || 'TEXT';
                            return [4 /*yield*/, fastify.prisma.suiviQuestion.create({
                                    data: {
                                        form_id: newForm.id,
                                        type: dbType,
                                        title: question.title || 'Untitled Question',
                                        description: question.description || null,
                                        required: question.required || false,
                                        order_index: i + 1,
                                        created_at: new Date(),
                                        updated_at: new Date()
                                    }
                                })];
                        case 3:
                            _c.sent();
                            _c.label = 4;
                        case 4:
                            i++;
                            return [3 /*break*/, 2];
                        case 5: return [4 /*yield*/, fastify.prisma.suiviForm.findUnique({
                                where: { id: newForm.id },
                                include: {
                                    questions: {
                                        orderBy: {
                                            order_index: 'asc'
                                        }
                                    }
                                }
                            })];
                        case 6:
                            completeForm = _c.sent();
                            return [2 /*return*/, reply.code(201).send({
                                    success: true,
                                    data: completeForm
                                })];
                        case 7:
                            error_3 = _c.sent();
                            fastify.log.error('Create suivi form error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 8: return [2 /*return*/];
                    }
                });
            }); });
            // Update suivi form status
            fastify.patch('/suivi/forms/:id/status', {
                schema: {
                    tags: ['Suivi'],
                    summary: 'Update suivi form status',
                    description: 'Update the status of a suivi form (active/paused/archived)',
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
                        required: ['status'],
                        properties: {
                            status: { type: 'string', enum: ['active', 'paused', 'archived'] }
                        }
                    },
                    response: {
                        200: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean' },
                                data: { type: 'object' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, status_1, statusMap, dbStatus, updatedForm, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = request.params.id;
                            status_1 = request.body.status;
                            statusMap = {
                                'active': 'ACTIVE',
                                'paused': 'ACTIVE', // Map paused to active for now
                                'archived': 'ARCHIVED'
                            };
                            dbStatus = statusMap[status_1.toLowerCase()] || 'ACTIVE';
                            return [4 /*yield*/, fastify.prisma.suiviForm.update({
                                    where: { id: id },
                                    data: {
                                        status: dbStatus,
                                        updated_at: new Date()
                                    }
                                })];
                        case 1:
                            updatedForm = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: updatedForm
                                })];
                        case 2:
                            error_4 = _a.sent();
                            fastify.log.error('Update suivi form status error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Delete suivi form
            fastify.delete('/suivi/forms/:id', {
                schema: {
                    tags: ['Suivi'],
                    summary: 'Delete a suivi form',
                    description: 'Delete a follow-up form and all its responses',
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
                                message: { type: 'string' }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            id = request.params.id;
                            // Delete all responses first
                            return [4 /*yield*/, fastify.prisma.suiviResponse.deleteMany({
                                    where: { form_id: id }
                                })];
                        case 1:
                            // Delete all responses first
                            _a.sent();
                            // Delete all questions
                            return [4 /*yield*/, fastify.prisma.suiviQuestion.deleteMany({
                                    where: { form_id: id }
                                })];
                        case 2:
                            // Delete all questions
                            _a.sent();
                            // Delete the form
                            return [4 /*yield*/, fastify.prisma.suiviForm.delete({
                                    where: { id: id }
                                })];
                        case 3:
                            // Delete the form
                            _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Suivi form deleted successfully'
                                })];
                        case 4:
                            error_5 = _a.sent();
                            fastify.log.error('Delete suivi form error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
