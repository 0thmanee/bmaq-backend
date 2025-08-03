"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
/**
 * Authentication routes
 */
module.exports = async function (fastify) {
    // Login route
    fastify.post('/auth/login', {
        schema: {
            tags: ['Auth'],
            summary: 'User login',
            description: 'Authenticate user with email and password',
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        token: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                name: { type: 'string' },
                                role: { type: 'string' },
                                status: { type: 'string' },
                                email_verified: { type: 'boolean' },
                                startup: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        company_name: { type: 'string' },
                                        status: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { email, password } = request.body;
            // Find user by email with startup relation
            const user = await fastify.prisma.user.findUnique({
                where: { email },
                include: {
                    startup: {
                        select: {
                            id: true,
                            company_name: true,
                            status: true
                        }
                    }
                }
            });
            if (!user) {
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            // Check if user is approved
            if (user.status !== 'APPROVED') {
                return reply.code(401).send({
                    success: false,
                    message: 'Your account is not approved yet'
                });
            }
            // Verify password
            const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            // Generate JWT token
            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
            // Prepare user response
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                email_verified: user.email_verified,
                startup: user.startup || undefined
            };
            // Update last login (for admin users if needed)
            await fastify.prisma.user.update({
                where: { id: user.id },
                data: { updated_at: new Date() }
            });
            return reply.send({
                success: true,
                message: 'Login successful',
                token,
                user: userResponse
            });
        }
        catch (error) {
            fastify.log.error('Login error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get current user profile
    fastify.get('/auth/me', {
        schema: {
            tags: ['Auth'],
            summary: 'Get current user profile',
            description: 'Get authenticated user information',
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
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                name: { type: 'string' },
                                role: { type: 'string' },
                                status: { type: 'string' },
                                email_verified: { type: 'boolean' },
                                startup: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string' },
                                        company_name: { type: 'string' },
                                        status: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                401: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return reply.code(401).send({
                    success: false,
                    message: 'No token provided'
                });
            }
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Get user with startup information
                const user = await fastify.prisma.user.findUnique({
                    where: { id: decoded.id },
                    include: {
                        startup: {
                            select: {
                                id: true,
                                company_name: true,
                                status: true,
                                industry: true,
                                founded_year: true,
                                team_size: true,
                                website: true,
                                description: true
                            }
                        }
                    }
                });
                if (!user) {
                    return reply.code(401).send({
                        success: false,
                        message: 'User not found'
                    });
                }
                return reply.send({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        status: user.status,
                        email_verified: user.email_verified,
                        startup: user.startup || undefined
                    }
                });
            }
            catch (jwtError) {
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid token'
                });
            }
        }
        catch (error) {
            fastify.log.error('Get user profile error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Logout route (for token blacklisting if needed)
    fastify.post('/auth/logout', {
        schema: {
            tags: ['Auth'],
            summary: 'User logout',
            description: 'Logout user (client should remove token)',
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        // For now, just return success - the client will remove the token
        // In a production app, you might want to blacklist the token
        return reply.send({
            success: true,
            message: 'Logout successful'
        });
    });
    // Verify token route (utility route)
    fastify.post('/auth/verify', {
        schema: {
            tags: ['Auth'],
            summary: 'Verify JWT token',
            description: 'Verify if a JWT token is valid',
            body: {
                type: 'object',
                required: ['token'],
                properties: {
                    token: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        valid: { type: 'boolean' },
                        decoded: { type: 'object' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { token } = request.body;
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return reply.send({
                success: true,
                valid: true,
                decoded
            });
        }
        catch (error) {
            return reply.send({
                success: true,
                valid: false,
                decoded: null
            });
        }
    });
};
//# sourceMappingURL=auth.js.map