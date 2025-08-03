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
 * Events management routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get all events with filtering
            fastify.get('/events/list', {
                schema: {
                    tags: ['Events'],
                    summary: 'Get all events with filtering',
                    description: 'Retrieve events list with optional filtering and search',
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
                            type: { type: 'string', default: 'all' },
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
                                            id: { type: 'string' },
                                            title: { type: 'string' },
                                            description: { type: 'string' },
                                            type: { type: 'string' },
                                            status: { type: 'string' },
                                            date: { type: 'string' },
                                            time: { type: 'string' },
                                            duration: { type: 'string' },
                                            location: { type: 'string' },
                                            maxAttendees: { type: 'number' },
                                            currentAttendees: { type: 'number' },
                                            registrationDeadline: { type: 'string' },
                                            isPublic: { type: 'boolean' },
                                            requiresApproval: { type: 'boolean' },
                                            createdDate: { type: 'string' },
                                            attendees: {
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        name: { type: 'string' },
                                                        email: { type: 'string' },
                                                        status: { type: 'string' }
                                                    }
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
                var _a, _b, status_1, _c, type, _d, search, _e, limit, where, events, transformedEvents, error_1;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 3]);
                            _a = request.query, _b = _a.status, status_1 = _b === void 0 ? 'all' : _b, _c = _a.type, type = _c === void 0 ? 'all' : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.limit, limit = _e === void 0 ? 50 : _e;
                            where = {};
                            if (status_1 !== 'all') {
                                where.status = status_1.toUpperCase();
                            }
                            if (type !== 'all') {
                                where.type = type.toUpperCase();
                            }
                            if (search) {
                                where.OR = [
                                    { title: { contains: search, mode: 'insensitive' } },
                                    { description: { contains: search, mode: 'insensitive' } },
                                    { location: { contains: search, mode: 'insensitive' } }
                                ];
                            }
                            return [4 /*yield*/, fastify.prisma.event.findMany({
                                    where: where,
                                    include: {
                                        attendees: {
                                            include: {
                                                user: {
                                                    select: {
                                                        name: true,
                                                        email: true
                                                    }
                                                },
                                                startup: {
                                                    select: {
                                                        company_name: true
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    },
                                    take: limit
                                })];
                        case 1:
                            events = _f.sent();
                            transformedEvents = events.map(function (event, index) {
                                // Transform attendees
                                var attendees = event.attendees.map(function (attendee, attendeeIndex) {
                                    var _a;
                                    return ({
                                        id: attendee.id, // Use actual database ID
                                        name: attendee.user.name || ((_a = attendee.startup) === null || _a === void 0 ? void 0 : _a.company_name) || 'Unknown',
                                        email: attendee.user.email,
                                        status: capitalizeFirst(attendee.status.toLowerCase())
                                    });
                                });
                                // Convert enum values to frontend format
                                var eventType = capitalizeFirst(event.type.toLowerCase());
                                var eventStatus = capitalizeFirst(event.status.toLowerCase());
                                return {
                                    id: event.id, // Use actual database ID
                                    title: event.title,
                                    description: event.description,
                                    type: eventType,
                                    status: eventStatus,
                                    date: event.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
                                    time: event.time,
                                    duration: event.duration,
                                    location: event.location,
                                    maxAttendees: event.max_attendees,
                                    currentAttendees: event.current_attendees,
                                    registrationDeadline: event.registration_deadline.toISOString().split('T')[0],
                                    isPublic: event.is_public,
                                    requiresApproval: event.requires_approval,
                                    createdDate: event.created_at.toISOString().split('T')[0],
                                    attendees: attendees
                                };
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedEvents
                                })];
                        case 2:
                            error_1 = _f.sent();
                            fastify.log.error('Events list error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get events statistics
            fastify.get('/events/stats', {
                schema: {
                    tags: ['Events'],
                    summary: 'Get events statistics',
                    description: 'Get aggregated events statistics for the dashboard',
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
                                        totalEvents: { type: 'number' },
                                        upcomingEvents: { type: 'number' },
                                        completedEvents: { type: 'number' },
                                        totalAttendees: { type: 'number' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var totalEvents, upcomingEvents, completedEvents, attendeesResult, totalAttendees, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, fastify.prisma.event.count()];
                        case 1:
                            totalEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: {
                                        status: 'UPCOMING'
                                    }
                                })];
                        case 2:
                            upcomingEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: {
                                        status: 'COMPLETED'
                                    }
                                })];
                        case 3:
                            completedEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.aggregate({
                                    _sum: {
                                        current_attendees: true
                                    }
                                })];
                        case 4:
                            attendeesResult = _a.sent();
                            totalAttendees = attendeesResult._sum.current_attendees || 0;
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalEvents: totalEvents,
                                        upcomingEvents: upcomingEvents,
                                        completedEvents: completedEvents,
                                        totalAttendees: totalAttendees
                                    }
                                })];
                        case 5:
                            error_2 = _a.sent();
                            fastify.log.error('Events stats error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // Create new event
            fastify.post('/events/create', {
                schema: {
                    tags: ['Events'],
                    summary: 'Create new event',
                    description: 'Create a new event with all details',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['title', 'description', 'type', 'date', 'time', 'duration', 'location', 'maxAttendees', 'registrationDeadline'],
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            type: { type: 'string' },
                            date: { type: 'string' },
                            time: { type: 'string' },
                            duration: { type: 'string' },
                            location: { type: 'string' },
                            maxAttendees: { type: 'number' },
                            registrationDeadline: { type: 'string' },
                            isPublic: { type: 'boolean', default: true },
                            requiresApproval: { type: 'boolean', default: false }
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
                                        eventId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, title, description, type, date, time, duration, location_1, maxAttendees, registrationDeadline, _b, isPublic, _c, requiresApproval, user, eventType, eventDate, regDeadline, newEvent, error_3;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            _d.trys.push([0, 2, , 3]);
                            _a = request.body, title = _a.title, description = _a.description, type = _a.type, date = _a.date, time = _a.time, duration = _a.duration, location_1 = _a.location, maxAttendees = _a.maxAttendees, registrationDeadline = _a.registrationDeadline, _b = _a.isPublic, isPublic = _b === void 0 ? true : _b, _c = _a.requiresApproval, requiresApproval = _c === void 0 ? false : _c;
                            user = request.user;
                            eventType = type.toUpperCase();
                            eventDate = new Date(date);
                            regDeadline = new Date(registrationDeadline);
                            return [4 /*yield*/, fastify.prisma.event.create({
                                    data: {
                                        title: title,
                                        description: description,
                                        type: eventType,
                                        status: 'DRAFT', // Default status
                                        date: eventDate,
                                        time: time,
                                        duration: duration,
                                        location: location_1,
                                        max_attendees: maxAttendees,
                                        current_attendees: 0,
                                        registration_deadline: regDeadline,
                                        is_public: isPublic,
                                        requires_approval: requiresApproval,
                                        created_by: user.id
                                    }
                                })];
                        case 1:
                            newEvent = _d.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Event created successfully',
                                    data: {
                                        eventId: newEvent.id
                                    }
                                })];
                        case 2:
                            error_3 = _d.sent();
                            fastify.log.error('Event creation error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Delete event
            fastify.delete('/events/:id', {
                schema: {
                    tags: ['Events'],
                    summary: 'Delete an event',
                    description: 'Delete an event by ID',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    params: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' }
                        },
                        required: ['id']
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
                var eventId, existingEvent, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            eventId = request.params.id;
                            return [4 /*yield*/, fastify.prisma.event.findUnique({
                                    where: { id: eventId }
                                })];
                        case 1:
                            existingEvent = _a.sent();
                            if (!existingEvent) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Event not found'
                                    })];
                            }
                            // Delete the event
                            return [4 /*yield*/, fastify.prisma.event.delete({
                                    where: { id: eventId }
                                })];
                        case 2:
                            // Delete the event
                            _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Event deleted successfully'
                                })];
                        case 3:
                            error_4 = _a.sent();
                            fastify.log.error('Event deletion error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Get events list for startup users (public events only)
            fastify.get('/events/user/list', {
                schema: {
                    tags: ['Events'],
                    summary: 'Get public events for startup users',
                    description: 'Retrieve public events list for startup users',
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
                            type: { type: 'string', default: 'all' },
                            search: { type: 'string', default: '' },
                            limit: { type: 'number', default: 50 }
                        }
                    }
                },
                preHandler: authenticateUser
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, status_2, _c, type, _d, search, _e, limit, whereClause, events, transformedEvents, error_5;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 3]);
                            _a = request.query, _b = _a.status, status_2 = _b === void 0 ? 'all' : _b, _c = _a.type, type = _c === void 0 ? 'all' : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.limit, limit = _e === void 0 ? 50 : _e;
                            whereClause = {
                                is_public: true
                            };
                            if (status_2 !== 'all') {
                                whereClause.status = status_2.toUpperCase();
                            }
                            if (type !== 'all') {
                                whereClause.type = type.toUpperCase();
                            }
                            if (search) {
                                whereClause.OR = [
                                    { title: { contains: search, mode: 'insensitive' } },
                                    { description: { contains: search, mode: 'insensitive' } }
                                ];
                            }
                            return [4 /*yield*/, fastify.prisma.event.findMany({
                                    where: whereClause,
                                    orderBy: {
                                        date: 'asc'
                                    },
                                    take: limit
                                })];
                        case 1:
                            events = _f.sent();
                            transformedEvents = events.map(function (event) {
                                var _a;
                                return ({
                                    id: event.id,
                                    title: event.title,
                                    description: event.description,
                                    type: capitalizeFirst(event.type),
                                    status: capitalizeFirst(event.status),
                                    date: event.date.toISOString().split('T')[0],
                                    time: event.time,
                                    duration: event.duration,
                                    location: event.location,
                                    maxAttendees: event.max_attendees,
                                    currentAttendees: event.current_attendees || 0,
                                    registrationDeadline: ((_a = event.registration_deadline) === null || _a === void 0 ? void 0 : _a.toISOString().split('T')[0]) || null,
                                    isPublic: event.is_public,
                                    requiresApproval: event.requires_approval,
                                    createdDate: event.created_at.toISOString().split('T')[0]
                                });
                            });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedEvents
                                })];
                        case 2:
                            error_5 = _f.sent();
                            fastify.log.error('User events list error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get events statistics for startup users
            fastify.get('/events/user/stats', {
                schema: {
                    tags: ['Events'],
                    summary: 'Get events statistics for startup users',
                    description: 'Get aggregated statistics for public events',
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
                var totalEvents, upcomingEvents, completedEvents, totalAttendees, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: { is_public: true }
                                })];
                        case 1:
                            totalEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: {
                                        is_public: true,
                                        status: 'UPCOMING'
                                    }
                                })];
                        case 2:
                            upcomingEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.count({
                                    where: {
                                        is_public: true,
                                        status: 'COMPLETED'
                                    }
                                })];
                        case 3:
                            completedEvents = _a.sent();
                            return [4 /*yield*/, fastify.prisma.event.aggregate({
                                    where: { is_public: true },
                                    _sum: { current_attendees: true }
                                })];
                        case 4:
                            totalAttendees = _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalEvents: totalEvents,
                                        upcomingEvents: upcomingEvents,
                                        completedEvents: completedEvents,
                                        totalAttendees: totalAttendees._sum.current_attendees || 0
                                    }
                                })];
                        case 5:
                            error_6 = _a.sent();
                            fastify.log.error('User events stats error:', error_6);
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
// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
