"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
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
        if (decoded.role !== 'ADMIN') {
            return reply.code(403).send({
                success: false,
                message: 'Admin access required'
            });
        }
        request.user = decoded;
    }
    catch (error) {
        return reply.code(401).send({
            success: false,
            message: 'Invalid token'
        });
    }
}
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
        request.user = decoded;
    }
    catch (error) {
        return reply.code(401).send({
            success: false,
            message: 'Invalid token'
        });
    }
}
module.exports = async function (fastify) {
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
    }, async (request, reply) => {
        try {
            const { status = 'all', type = 'all', search = '', limit = 50 } = request.query;
            const where = {};
            if (status !== 'all') {
                where.status = status.toUpperCase();
            }
            if (type !== 'all') {
                where.type = type.toUpperCase();
            }
            if (search) {
                where.OR = [
                    { title: { contains: search } },
                    { description: { contains: search } },
                    { location: { contains: search } }
                ];
            }
            const events = await fastify.prisma.event.findMany({
                where,
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
            });
            const transformedEvents = events.map((event, index) => {
                const attendees = event.attendees.map((attendee, attendeeIndex) => ({
                    id: attendee.id,
                    name: attendee.user.name || attendee.startup?.company_name || 'Unknown',
                    email: attendee.user.email,
                    status: capitalizeFirst(attendee.status.toLowerCase())
                }));
                const eventType = capitalizeFirst(event.type.toLowerCase());
                const eventStatus = capitalizeFirst(event.status.toLowerCase());
                return {
                    id: event.id,
                    title: event.title,
                    description: event.description,
                    type: eventType,
                    status: eventStatus,
                    date: event.date.toISOString().split('T')[0],
                    time: event.time,
                    duration: event.duration,
                    location: event.location,
                    maxAttendees: event.max_attendees,
                    currentAttendees: event.current_attendees,
                    registrationDeadline: event.registration_deadline.toISOString().split('T')[0],
                    isPublic: event.is_public,
                    requiresApproval: event.requires_approval,
                    createdDate: event.created_at.toISOString().split('T')[0],
                    attendees
                };
            });
            return reply.send({
                success: true,
                data: transformedEvents
            });
        }
        catch (error) {
            fastify.log.error('Events list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const totalEvents = await fastify.prisma.event.count();
            const upcomingEvents = await fastify.prisma.event.count({
                where: {
                    status: 'UPCOMING'
                }
            });
            const completedEvents = await fastify.prisma.event.count({
                where: {
                    status: 'COMPLETED'
                }
            });
            const attendeesResult = await fastify.prisma.event.aggregate({
                _sum: {
                    current_attendees: true
                }
            });
            const totalAttendees = attendeesResult._sum.current_attendees || 0;
            return reply.send({
                success: true,
                data: {
                    totalEvents,
                    upcomingEvents,
                    completedEvents,
                    totalAttendees
                }
            });
        }
        catch (error) {
            fastify.log.error('Events stats error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { title, description, type, date, time, duration, location, maxAttendees, registrationDeadline, isPublic = true, requiresApproval = false } = request.body;
            const user = request.user;
            const eventType = type.toUpperCase();
            const eventDate = new Date(date);
            const regDeadline = new Date(registrationDeadline);
            const newEvent = await fastify.prisma.event.create({
                data: {
                    title,
                    description,
                    type: eventType,
                    status: 'DRAFT',
                    date: eventDate,
                    time,
                    duration,
                    location,
                    max_attendees: maxAttendees,
                    current_attendees: 0,
                    registration_deadline: regDeadline,
                    is_public: isPublic,
                    requires_approval: requiresApproval,
                    created_by: user.id
                }
            });
            return reply.send({
                success: true,
                message: 'Event created successfully',
                data: {
                    eventId: newEvent.id
                }
            });
        }
        catch (error) {
            fastify.log.error('Event creation error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const eventId = request.params.id;
            const existingEvent = await fastify.prisma.event.findUnique({
                where: { id: eventId }
            });
            if (!existingEvent) {
                return reply.code(404).send({
                    success: false,
                    message: 'Event not found'
                });
            }
            await fastify.prisma.event.delete({
                where: { id: eventId }
            });
            return reply.send({
                success: true,
                message: 'Event deleted successfully'
            });
        }
        catch (error) {
            fastify.log.error('Event deletion error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { status = 'all', type = 'all', search = '', limit = 50 } = request.query;
            const whereClause = {
                is_public: true
            };
            if (status !== 'all') {
                whereClause.status = status.toUpperCase();
            }
            if (type !== 'all') {
                whereClause.type = type.toUpperCase();
            }
            if (search) {
                whereClause.OR = [
                    { title: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            const events = await fastify.prisma.event.findMany({
                where: whereClause,
                orderBy: {
                    date: 'asc'
                },
                take: limit
            });
            const transformedEvents = events.map((event) => ({
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
                registrationDeadline: event.registration_deadline?.toISOString().split('T')[0] || null,
                isPublic: event.is_public,
                requiresApproval: event.requires_approval,
                createdDate: event.created_at.toISOString().split('T')[0]
            }));
            return reply.send({
                success: true,
                data: transformedEvents
            });
        }
        catch (error) {
            fastify.log.error('User events list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const totalEvents = await fastify.prisma.event.count({
                where: { is_public: true }
            });
            const upcomingEvents = await fastify.prisma.event.count({
                where: {
                    is_public: true,
                    status: 'UPCOMING'
                }
            });
            const completedEvents = await fastify.prisma.event.count({
                where: {
                    is_public: true,
                    status: 'COMPLETED'
                }
            });
            const totalAttendees = await fastify.prisma.event.aggregate({
                where: { is_public: true },
                _sum: { current_attendees: true }
            });
            return reply.send({
                success: true,
                data: {
                    totalEvents,
                    upcomingEvents,
                    completedEvents,
                    totalAttendees: totalAttendees._sum.current_attendees || 0
                }
            });
        }
        catch (error) {
            fastify.log.error('User events stats error:', error);
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
//# sourceMappingURL=events.js.map