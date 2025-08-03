"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
module.exports = async function (fastify) {
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
            if (user.status !== 'APPROVED') {
                return reply.code(401).send({
                    success: false,
                    message: 'Your account is not approved yet'
                });
            }
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return reply.code(401).send({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            const tokenPayload = {
                id: user.id,
                email: user.email,
                role: user.role,
                status: user.status
            };
            const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
            const userResponse = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                status: user.status,
                email_verified: user.email_verified,
                startup: user.startup || undefined
            };
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
                const decoded = jwt.verify(token, JWT_SECRET);
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
    fastify.post('/auth/register', {
        schema: {
            tags: ['Auth'],
            summary: 'User registration',
            description: 'Register a new startup user account',
            body: {
                type: 'object',
                required: ['name', 'email', 'password', 'confirmPassword', 'companyName', 'industry', 'foundedYear', 'teamSize', 'website', 'description'],
                properties: {
                    name: { type: 'string', minLength: 1 },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    confirmPassword: { type: 'string', minLength: 6 },
                    companyName: { type: 'string', minLength: 1 },
                    industry: { type: 'string', minLength: 1 },
                    foundedYear: { type: 'string' },
                    teamSize: { type: 'string' },
                    website: { type: 'string' },
                    description: { type: 'string', minLength: 1 }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                name: { type: 'string' },
                                role: { type: 'string' },
                                status: { type: 'string' }
                            }
                        }
                    }
                },
                400: {
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
            const { name, email, password, confirmPassword, companyName, industry, foundedYear, teamSize, website, description } = request.body;
            if (password !== confirmPassword) {
                return reply.code(400).send({
                    success: false,
                    message: 'Passwords do not match'
                });
            }
            const existingUser = await fastify.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return reply.code(400).send({
                    success: false,
                    message: 'User with this email already exists'
                });
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            const result = await fastify.prisma.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: 'STARTUP',
                        status: 'PENDING',
                        email_verified: false
                    }
                });
                const startup = await prisma.startup.create({
                    data: {
                        user_id: user.id,
                        company_name: companyName,
                        description,
                        industry,
                        founded_year: parseInt(foundedYear),
                        team_size: teamSize,
                        website: website || null,
                        status: 'PENDING'
                    }
                });
                return { user, startup };
            });
            return reply.send({
                success: true,
                message: 'Registration successful! Your account is pending admin approval.',
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                    status: result.user.status
                }
            });
        }
        catch (error) {
            fastify.log.error('Registration error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Registration failed. Please try again.'
            });
        }
    });
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
        return reply.send({
            success: true,
            message: 'Logout successful'
        });
    });
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
            const decoded = jwt.verify(token, JWT_SECRET);
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