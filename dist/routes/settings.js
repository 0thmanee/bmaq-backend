"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
 * Settings routes for admin configuration
 */
module.exports = async function (fastify) {
    // Get all settings (general endpoint)
    fastify.get('/settings', {
        schema: {
            tags: ['Settings'],
            summary: 'Get all settings',
            description: 'Get all system configuration settings (general endpoint)',
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
                                systemSettings: {
                                    type: 'object',
                                    properties: {
                                        appName: { type: 'string' },
                                        defaultBudget: { type: 'number' },
                                        maxFileSize: { type: 'number' },
                                        allowedFileTypes: { type: 'string' },
                                        smtpServer: { type: 'string' },
                                        smtpPort: { type: 'number' },
                                        smtpUser: { type: 'string' },
                                        smtpPassword: { type: 'string' },
                                        autoApproval: { type: 'boolean' },
                                        maintenanceMode: { type: 'boolean' },
                                        analyticsEnabled: { type: 'boolean' },
                                        notificationsEnabled: { type: 'boolean' }
                                    }
                                },
                                users: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'string' },
                                            name: { type: 'string' },
                                            email: { type: 'string' },
                                            role: { type: 'string' },
                                            status: { type: 'string' },
                                            lastLogin: { type: 'string' },
                                            createdDate: { type: 'string' }
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
            // Get all system settings
            const settings = await fastify.prisma.systemSetting.findMany();
            // Transform settings into grouped object
            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.key] = setting.value;
            });
            // Get all users (both admin and startup)
            const allUsers = await fastify.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: [
                    { role: 'asc' }, // Admin users first
                    { created_at: 'desc' }
                ]
            });
            // Transform users
            const users = allUsers.map(user => ({
                id: user.id,
                name: user.name || 'Unknown',
                email: user.email,
                role: user.role === 'ADMIN' ? 'Super Admin' : 'Startup',
                status: user.status === 'APPROVED' ? 'Active' : 'Inactive',
                lastLogin: user.updated_at.toISOString(),
                createdDate: user.created_at.toISOString().split('T')[0]
            }));
            // Get system info
            const uptime = process.uptime();
            const uptimeDays = Math.floor(uptime / (24 * 60 * 60));
            const uptimeHours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const systemInfo = {
                platformVersion: 'v2.1.0',
                databaseVersion: 'PostgreSQL 14.2',
                serverUptime: `${uptimeDays} days, ${uptimeHours} hours`,
                lastBackup: '2 hours ago'
            };
            // Prepare response in the format expected by frontend
            const response = {
                systemSettings: {
                    appName: settingsMap.site_name || 'BMAQ',
                    defaultBudget: parseInt(settingsMap.default_budget || '75000'),
                    maxFileSize: parseInt(settingsMap.max_file_size || '10'), // MB
                    allowedFileTypes: settingsMap.allowed_file_types || 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png',
                    smtpServer: settingsMap.smtp_server || 'smtp.bmaq.com',
                    smtpPort: parseInt(settingsMap.smtp_port || '587'),
                    smtpUser: settingsMap.smtp_username || 'admin@bmaq.com',
                    smtpPassword: settingsMap.smtp_password || '••••••••',
                    autoApproval: settingsMap.auto_approval === 'true',
                    maintenanceMode: settingsMap.maintenance_mode === 'true',
                    analyticsEnabled: settingsMap.analytics_enabled !== 'false',
                    notificationsEnabled: settingsMap.email_notifications !== 'false'
                },
                users
            };
            return reply.send({
                success: true,
                data: response
            });
        }
        catch (error) {
            fastify.log.error('Get all settings error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Create new user
    fastify.post('/settings/users', {
        schema: {
            tags: ['Settings'],
            summary: 'Create new user',
            description: 'Create a new user account',
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                required: ['name', 'email', 'role', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'startup'] },
                    password: { type: 'string', minLength: 6 }
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
                                userId: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: authenticateAdmin
    }, async (request, reply) => {
        try {
            const { name, email, role, password } = request.body;
            // Check if user already exists
            const existingUser = await fastify.prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return reply.code(400).send({
                    success: false,
                    message: 'User with this email already exists'
                });
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Map frontend role to database role
            const dbRole = role === 'admin' ? 'ADMIN' : 'STARTUP';
            // Create user
            const newUser = await fastify.prisma.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: dbRole,
                    status: 'APPROVED',
                    email_verified: true
                }
            });
            return reply.send({
                success: true,
                message: 'User created successfully',
                data: {
                    userId: newUser.id
                }
            });
        }
        catch (error) {
            fastify.log.error('Create user error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get all system settings
    fastify.get('/settings/system', {
        schema: {
            tags: ['Settings'],
            summary: 'Get system settings',
            description: 'Get all system configuration settings',
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
                                generalSettings: {
                                    type: 'object',
                                    properties: {
                                        platformName: { type: 'string' },
                                        platformDescription: { type: 'string' },
                                        timezone: { type: 'string' },
                                        language: { type: 'string' },
                                        currency: { type: 'string' },
                                        maintenanceMode: { type: 'boolean' }
                                    }
                                },
                                emailSettings: {
                                    type: 'object',
                                    properties: {
                                        smtpServer: { type: 'string' },
                                        smtpPort: { type: 'string' },
                                        smtpUsername: { type: 'string' },
                                        smtpPassword: { type: 'string' },
                                        fromEmail: { type: 'string' },
                                        fromName: { type: 'string' }
                                    }
                                },
                                notificationSettings: {
                                    type: 'object',
                                    properties: {
                                        emailNotifications: { type: 'boolean' },
                                        requestNotifications: { type: 'boolean' },
                                        eventNotifications: { type: 'boolean' },
                                        budgetAlerts: { type: 'boolean' },
                                        systemAlerts: { type: 'boolean' },
                                        weeklyReports: { type: 'boolean' }
                                    }
                                },
                                securitySettings: {
                                    type: 'object',
                                    properties: {
                                        twoFactorAuth: { type: 'boolean' },
                                        sessionTimeout: { type: 'string' },
                                        passwordExpiry: { type: 'string' },
                                        loginAttempts: { type: 'string' },
                                        ipWhitelist: { type: 'boolean' },
                                        auditLogging: { type: 'boolean' }
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
            // Get all system settings
            const settings = await fastify.prisma.systemSetting.findMany();
            // Transform settings into grouped object
            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.key] = setting.value;
            });
            // Default settings with database overrides
            const response = {
                generalSettings: {
                    platformName: settingsMap.site_name || 'BMAQ',
                    platformDescription: settingsMap.site_description || 'Business Model Acceleration & Qualification',
                    timezone: settingsMap.timezone || 'Europe/Paris',
                    language: settingsMap.language || 'French',
                    currency: settingsMap.currency || 'EUR',
                    maintenanceMode: settingsMap.maintenance_mode === 'true'
                },
                emailSettings: {
                    smtpServer: settingsMap.smtp_server || 'smtp.bmaq.com',
                    smtpPort: settingsMap.smtp_port || '587',
                    smtpUsername: settingsMap.smtp_username || 'admin@bmaq.com',
                    smtpPassword: settingsMap.smtp_password || '••••••••',
                    fromEmail: settingsMap.from_email || 'noreply@bmaq.com',
                    fromName: settingsMap.from_name || 'BMAQ Platform'
                },
                notificationSettings: {
                    emailNotifications: settingsMap.email_notifications !== 'false',
                    requestNotifications: settingsMap.request_notifications !== 'false',
                    eventNotifications: settingsMap.event_notifications !== 'false',
                    budgetAlerts: settingsMap.budget_alerts !== 'false',
                    systemAlerts: settingsMap.system_alerts !== 'false',
                    weeklyReports: settingsMap.weekly_reports !== 'false'
                },
                securitySettings: {
                    twoFactorAuth: settingsMap.two_factor_auth === 'true',
                    sessionTimeout: settingsMap.session_timeout || '30',
                    passwordExpiry: settingsMap.password_expiry || '90',
                    loginAttempts: settingsMap.login_attempts || '5',
                    ipWhitelist: settingsMap.ip_whitelist === 'true',
                    auditLogging: settingsMap.audit_logging !== 'false'
                }
            };
            return reply.send({
                success: true,
                data: response
            });
        }
        catch (error) {
            fastify.log.error('Get system settings error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Update system settings
    fastify.post('/settings/system', {
        schema: {
            tags: ['Settings'],
            summary: 'Update system settings',
            description: 'Update system configuration settings',
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    generalSettings: {
                        type: 'object',
                        properties: {
                            platformName: { type: 'string' },
                            platformDescription: { type: 'string' },
                            timezone: { type: 'string' },
                            language: { type: 'string' },
                            currency: { type: 'string' },
                            maintenanceMode: { type: 'boolean' }
                        }
                    },
                    emailSettings: {
                        type: 'object',
                        properties: {
                            smtpServer: { type: 'string' },
                            smtpPort: { type: 'string' },
                            smtpUsername: { type: 'string' },
                            smtpPassword: { type: 'string' },
                            fromEmail: { type: 'string' },
                            fromName: { type: 'string' }
                        }
                    },
                    notificationSettings: {
                        type: 'object',
                        properties: {
                            emailNotifications: { type: 'boolean' },
                            requestNotifications: { type: 'boolean' },
                            eventNotifications: { type: 'boolean' },
                            budgetAlerts: { type: 'boolean' },
                            systemAlerts: { type: 'boolean' },
                            weeklyReports: { type: 'boolean' }
                        }
                    },
                    securitySettings: {
                        type: 'object',
                        properties: {
                            twoFactorAuth: { type: 'boolean' },
                            sessionTimeout: { type: 'string' },
                            passwordExpiry: { type: 'string' },
                            loginAttempts: { type: 'string' },
                            ipWhitelist: { type: 'boolean' },
                            auditLogging: { type: 'boolean' }
                        }
                    }
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
            const { generalSettings, emailSettings, notificationSettings, securitySettings } = request.body;
            // Update general settings
            if (generalSettings) {
                const updates = [
                    { key: 'site_name', value: generalSettings.platformName },
                    { key: 'site_description', value: generalSettings.platformDescription },
                    { key: 'timezone', value: generalSettings.timezone },
                    { key: 'language', value: generalSettings.language },
                    { key: 'currency', value: generalSettings.currency },
                    { key: 'maintenance_mode', value: generalSettings.maintenanceMode?.toString() }
                ];
                for (const update of updates) {
                    if (update.value !== undefined) {
                        await fastify.prisma.systemSetting.upsert({
                            where: { key: update.key },
                            update: { value: update.value, updated_at: new Date() },
                            create: { key: update.key, value: update.value }
                        });
                    }
                }
            }
            // Update email settings
            if (emailSettings) {
                const updates = [
                    { key: 'smtp_server', value: emailSettings.smtpServer },
                    { key: 'smtp_port', value: emailSettings.smtpPort },
                    { key: 'smtp_username', value: emailSettings.smtpUsername },
                    { key: 'smtp_password', value: emailSettings.smtpPassword },
                    { key: 'from_email', value: emailSettings.fromEmail },
                    { key: 'from_name', value: emailSettings.fromName }
                ];
                for (const update of updates) {
                    if (update.value !== undefined) {
                        await fastify.prisma.systemSetting.upsert({
                            where: { key: update.key },
                            update: { value: update.value, updated_at: new Date() },
                            create: { key: update.key, value: update.value }
                        });
                    }
                }
            }
            // Update notification settings
            if (notificationSettings) {
                const updates = [
                    { key: 'email_notifications', value: notificationSettings.emailNotifications?.toString() },
                    { key: 'request_notifications', value: notificationSettings.requestNotifications?.toString() },
                    { key: 'event_notifications', value: notificationSettings.eventNotifications?.toString() },
                    { key: 'budget_alerts', value: notificationSettings.budgetAlerts?.toString() },
                    { key: 'system_alerts', value: notificationSettings.systemAlerts?.toString() },
                    { key: 'weekly_reports', value: notificationSettings.weeklyReports?.toString() }
                ];
                for (const update of updates) {
                    if (update.value !== undefined) {
                        await fastify.prisma.systemSetting.upsert({
                            where: { key: update.key },
                            update: { value: update.value, updated_at: new Date() },
                            create: { key: update.key, value: update.value }
                        });
                    }
                }
            }
            // Update security settings
            if (securitySettings) {
                const updates = [
                    { key: 'two_factor_auth', value: securitySettings.twoFactorAuth?.toString() },
                    { key: 'session_timeout', value: securitySettings.sessionTimeout },
                    { key: 'password_expiry', value: securitySettings.passwordExpiry },
                    { key: 'login_attempts', value: securitySettings.loginAttempts },
                    { key: 'ip_whitelist', value: securitySettings.ipWhitelist?.toString() },
                    { key: 'audit_logging', value: securitySettings.auditLogging?.toString() }
                ];
                for (const update of updates) {
                    if (update.value !== undefined) {
                        await fastify.prisma.systemSetting.upsert({
                            where: { key: update.key },
                            update: { value: update.value, updated_at: new Date() },
                            create: { key: update.key, value: update.value }
                        });
                    }
                }
            }
            return reply.send({
                success: true,
                message: 'Settings updated successfully'
            });
        }
        catch (error) {
            fastify.log.error('Update system settings error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get admin users
    fastify.get('/settings/users', {
        schema: {
            tags: ['Settings'],
            summary: 'Get admin users',
            description: 'Get list of admin users for management',
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
                                    id: { type: 'string' },
                                    name: { type: 'string' },
                                    email: { type: 'string' },
                                    role: { type: 'string' },
                                    status: { type: 'string' },
                                    lastLogin: { type: 'string' },
                                    createdDate: { type: 'string' }
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
            // Get all users (both admin and startup)
            const allUsers = await fastify.prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    status: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: [
                    { role: 'asc' }, // Admin users first
                    { created_at: 'desc' }
                ]
            });
            // Transform to match frontend expectations
            const users = allUsers.map(user => ({
                id: user.id,
                name: user.name || 'Unknown',
                email: user.email,
                role: user.role === 'ADMIN' ? 'Super Admin' : 'Startup',
                status: user.status === 'APPROVED' ? 'Active' : 'Inactive',
                lastLogin: user.updated_at.toISOString(),
                createdDate: user.created_at.toISOString().split('T')[0]
            }));
            return reply.send({
                success: true,
                data: users
            });
        }
        catch (error) {
            fastify.log.error('Get admin users error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Get system information
    fastify.get('/settings/system-info', {
        schema: {
            tags: ['Settings'],
            summary: 'Get system information',
            description: 'Get system health and information',
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
                                platformVersion: { type: 'string' },
                                databaseVersion: { type: 'string' },
                                serverUptime: { type: 'string' },
                                lastBackup: { type: 'string' }
                            }
                        }
                    }
                }
            }
        },
        preHandler: authenticateAdmin
    }, async (request, reply) => {
        try {
            const uptime = process.uptime();
            const uptimeDays = Math.floor(uptime / (24 * 60 * 60));
            const uptimeHours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
            const systemInfo = {
                platformVersion: 'v2.1.0',
                databaseVersion: 'PostgreSQL 14.2',
                serverUptime: `${uptimeDays} days, ${uptimeHours} hours`,
                lastBackup: '2 hours ago'
            };
            return reply.send({
                success: true,
                data: systemInfo
            });
        }
        catch (error) {
            fastify.log.error('Get system info error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Update all settings (general endpoint)
    fastify.put('/settings', {
        schema: {
            tags: ['Settings'],
            summary: 'Update all settings',
            description: 'Update system configuration settings (general endpoint)',
            headers: {
                type: 'object',
                required: ['authorization'],
                properties: {
                    authorization: { type: 'string' }
                }
            },
            body: {
                type: 'object',
                properties: {
                    appName: { type: 'string' },
                    defaultBudget: { type: 'number' },
                    maxFileSize: { type: 'number' },
                    allowedFileTypes: { type: 'string' },
                    smtpServer: { type: 'string' },
                    smtpPort: { type: 'number' },
                    smtpUser: { type: 'string' },
                    smtpPassword: { type: 'string' },
                    autoApproval: { type: 'boolean' },
                    maintenanceMode: { type: 'boolean' },
                    analyticsEnabled: { type: 'boolean' },
                    notificationsEnabled: { type: 'boolean' }
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
            const settings = request.body;
            // Map frontend settings to database keys
            const settingsMap = [
                { key: 'site_name', value: settings.appName },
                { key: 'default_budget', value: settings.defaultBudget?.toString() },
                { key: 'max_file_size', value: settings.maxFileSize?.toString() },
                { key: 'allowed_file_types', value: settings.allowedFileTypes },
                { key: 'smtp_server', value: settings.smtpServer },
                { key: 'smtp_port', value: settings.smtpPort?.toString() },
                { key: 'smtp_username', value: settings.smtpUser },
                { key: 'smtp_password', value: settings.smtpPassword },
                { key: 'auto_approval', value: settings.autoApproval?.toString() },
                { key: 'maintenance_mode', value: settings.maintenanceMode?.toString() },
                { key: 'analytics_enabled', value: settings.analyticsEnabled?.toString() },
                { key: 'email_notifications', value: settings.notificationsEnabled?.toString() }
            ];
            // Update each setting in database
            for (const setting of settingsMap) {
                if (setting.value !== undefined) {
                    await fastify.prisma.systemSetting.upsert({
                        where: { key: setting.key },
                        update: {
                            value: setting.value,
                            updated_at: new Date()
                        },
                        create: {
                            key: setting.key,
                            value: setting.value,
                            description: `Updated via settings page`
                        }
                    });
                }
            }
            return reply.send({
                success: true,
                message: 'Settings updated successfully'
            });
        }
        catch (error) {
            fastify.log.error('Update all settings error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Update user role
    fastify.put('/settings/users/:id/role', {
        schema: {
            tags: ['Settings'],
            summary: 'Update user role',
            description: 'Update a user\'s role (admin/startup)',
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
                required: ['role'],
                properties: {
                    role: { type: 'string', enum: ['admin', 'startup'] }
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
            const { role } = request.body;
            // Map frontend role to database role
            const dbRole = role === 'admin' ? 'ADMIN' : 'STARTUP';
            await fastify.prisma.user.update({
                where: { id },
                data: {
                    role: dbRole,
                    updated_at: new Date()
                }
            });
            return reply.send({
                success: true,
                message: 'User role updated successfully'
            });
        }
        catch (error) {
            fastify.log.error('Update user role error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
    // Update user status
    fastify.put('/settings/users/:id/status', {
        schema: {
            tags: ['Settings'],
            summary: 'Update user status',
            description: 'Update a user\'s status (active/inactive)',
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
                    status: { type: 'string', enum: ['active', 'inactive'] }
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
            const { status } = request.body;
            // Map frontend status to database status
            const dbStatus = status === 'active' ? 'APPROVED' : 'INACTIVE';
            await fastify.prisma.user.update({
                where: { id },
                data: {
                    status: dbStatus,
                    updated_at: new Date()
                }
            });
            return reply.send({
                success: true,
                message: 'User status updated successfully'
            });
        }
        catch (error) {
            fastify.log.error('Update user status error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
};
//# sourceMappingURL=settings.js.map