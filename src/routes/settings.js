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
var bcryptjs_1 = require("bcryptjs");
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
 * Settings routes for admin configuration
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var settings, settingsMap_1, allUsers, users, uptime, uptimeDays, uptimeHours, systemInfo, response, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fastify.prisma.systemSetting.findMany()];
                        case 1:
                            settings = _a.sent();
                            settingsMap_1 = {};
                            settings.forEach(function (setting) {
                                settingsMap_1[setting.key] = setting.value;
                            });
                            return [4 /*yield*/, fastify.prisma.user.findMany({
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
                                })];
                        case 2:
                            allUsers = _a.sent();
                            users = allUsers.map(function (user) { return ({
                                id: user.id,
                                name: user.name || 'Unknown',
                                email: user.email,
                                role: user.role === 'ADMIN' ? 'Super Admin' : 'Startup',
                                status: user.status === 'APPROVED' ? 'Active' : 'Inactive',
                                lastLogin: user.updated_at.toISOString(),
                                createdDate: user.created_at.toISOString().split('T')[0]
                            }); });
                            uptime = process.uptime();
                            uptimeDays = Math.floor(uptime / (24 * 60 * 60));
                            uptimeHours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
                            systemInfo = {
                                platformVersion: 'v2.1.0',
                                databaseVersion: 'PostgreSQL 14.2',
                                serverUptime: "".concat(uptimeDays, " days, ").concat(uptimeHours, " hours"),
                                lastBackup: '2 hours ago'
                            };
                            response = {
                                systemSettings: {
                                    appName: settingsMap_1.site_name || 'BMAQ',
                                    defaultBudget: parseInt(settingsMap_1.default_budget || '75000'),
                                    maxFileSize: parseInt(settingsMap_1.max_file_size || '10'), // MB
                                    allowedFileTypes: settingsMap_1.allowed_file_types || 'pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,png',
                                    smtpServer: settingsMap_1.smtp_server || 'smtp.bmaq.com',
                                    smtpPort: parseInt(settingsMap_1.smtp_port || '587'),
                                    smtpUser: settingsMap_1.smtp_username || 'admin@bmaq.com',
                                    smtpPassword: settingsMap_1.smtp_password || '••••••••',
                                    autoApproval: settingsMap_1.auto_approval === 'true',
                                    maintenanceMode: settingsMap_1.maintenance_mode === 'true',
                                    analyticsEnabled: settingsMap_1.analytics_enabled !== 'false',
                                    notificationsEnabled: settingsMap_1.email_notifications !== 'false'
                                },
                                users: users
                            };
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: response
                                })];
                        case 3:
                            error_1 = _a.sent();
                            fastify.log.error('Get all settings error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, name_1, email, role, password, existingUser, hashedPassword, dbRole, newUser, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = request.body, name_1 = _a.name, email = _a.email, role = _a.role, password = _a.password;
                            return [4 /*yield*/, fastify.prisma.user.findUnique({
                                    where: { email: email }
                                })];
                        case 1:
                            existingUser = _b.sent();
                            if (existingUser) {
                                return [2 /*return*/, reply.code(400).send({
                                        success: false,
                                        message: 'User with this email already exists'
                                    })];
                            }
                            return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
                        case 2:
                            hashedPassword = _b.sent();
                            dbRole = role === 'admin' ? 'ADMIN' : 'STARTUP';
                            return [4 /*yield*/, fastify.prisma.user.create({
                                    data: {
                                        name: name_1,
                                        email: email,
                                        password: hashedPassword,
                                        role: dbRole,
                                        status: 'APPROVED',
                                        email_verified: true
                                    }
                                })];
                        case 3:
                            newUser = _b.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'User created successfully',
                                    data: {
                                        userId: newUser.id
                                    }
                                })];
                        case 4:
                            error_2 = _b.sent();
                            fastify.log.error('Create user error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var settings, settingsMap_2, response, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fastify.prisma.systemSetting.findMany()];
                        case 1:
                            settings = _a.sent();
                            settingsMap_2 = {};
                            settings.forEach(function (setting) {
                                settingsMap_2[setting.key] = setting.value;
                            });
                            response = {
                                generalSettings: {
                                    platformName: settingsMap_2.site_name || 'BMAQ',
                                    platformDescription: settingsMap_2.site_description || 'Business Model Acceleration & Qualification',
                                    timezone: settingsMap_2.timezone || 'Europe/Paris',
                                    language: settingsMap_2.language || 'French',
                                    currency: settingsMap_2.currency || 'EUR',
                                    maintenanceMode: settingsMap_2.maintenance_mode === 'true'
                                },
                                emailSettings: {
                                    smtpServer: settingsMap_2.smtp_server || 'smtp.bmaq.com',
                                    smtpPort: settingsMap_2.smtp_port || '587',
                                    smtpUsername: settingsMap_2.smtp_username || 'admin@bmaq.com',
                                    smtpPassword: settingsMap_2.smtp_password || '••••••••',
                                    fromEmail: settingsMap_2.from_email || 'noreply@bmaq.com',
                                    fromName: settingsMap_2.from_name || 'BMAQ Platform'
                                },
                                notificationSettings: {
                                    emailNotifications: settingsMap_2.email_notifications !== 'false',
                                    requestNotifications: settingsMap_2.request_notifications !== 'false',
                                    eventNotifications: settingsMap_2.event_notifications !== 'false',
                                    budgetAlerts: settingsMap_2.budget_alerts !== 'false',
                                    systemAlerts: settingsMap_2.system_alerts !== 'false',
                                    weeklyReports: settingsMap_2.weekly_reports !== 'false'
                                },
                                securitySettings: {
                                    twoFactorAuth: settingsMap_2.two_factor_auth === 'true',
                                    sessionTimeout: settingsMap_2.session_timeout || '30',
                                    passwordExpiry: settingsMap_2.password_expiry || '90',
                                    loginAttempts: settingsMap_2.login_attempts || '5',
                                    ipWhitelist: settingsMap_2.ip_whitelist === 'true',
                                    auditLogging: settingsMap_2.audit_logging !== 'false'
                                }
                            };
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: response
                                })];
                        case 2:
                            error_3 = _a.sent();
                            fastify.log.error('Get system settings error:', error_3);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, generalSettings, emailSettings, notificationSettings, securitySettings, updates, _i, updates_1, update, updates, _b, updates_2, update, updates, _c, updates_3, update, updates, _d, updates_4, update, error_4;
                var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
                return __generator(this, function (_q) {
                    switch (_q.label) {
                        case 0:
                            _q.trys.push([0, 17, , 18]);
                            _a = request.body, generalSettings = _a.generalSettings, emailSettings = _a.emailSettings, notificationSettings = _a.notificationSettings, securitySettings = _a.securitySettings;
                            if (!generalSettings) return [3 /*break*/, 4];
                            updates = [
                                { key: 'site_name', value: generalSettings.platformName },
                                { key: 'site_description', value: generalSettings.platformDescription },
                                { key: 'timezone', value: generalSettings.timezone },
                                { key: 'language', value: generalSettings.language },
                                { key: 'currency', value: generalSettings.currency },
                                { key: 'maintenance_mode', value: (_e = generalSettings.maintenanceMode) === null || _e === void 0 ? void 0 : _e.toString() }
                            ];
                            _i = 0, updates_1 = updates;
                            _q.label = 1;
                        case 1:
                            if (!(_i < updates_1.length)) return [3 /*break*/, 4];
                            update = updates_1[_i];
                            if (!(update.value !== undefined)) return [3 /*break*/, 3];
                            return [4 /*yield*/, fastify.prisma.systemSetting.upsert({
                                    where: { key: update.key },
                                    update: { value: update.value, updated_at: new Date() },
                                    create: { key: update.key, value: update.value }
                                })];
                        case 2:
                            _q.sent();
                            _q.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4:
                            if (!emailSettings) return [3 /*break*/, 8];
                            updates = [
                                { key: 'smtp_server', value: emailSettings.smtpServer },
                                { key: 'smtp_port', value: emailSettings.smtpPort },
                                { key: 'smtp_username', value: emailSettings.smtpUsername },
                                { key: 'smtp_password', value: emailSettings.smtpPassword },
                                { key: 'from_email', value: emailSettings.fromEmail },
                                { key: 'from_name', value: emailSettings.fromName }
                            ];
                            _b = 0, updates_2 = updates;
                            _q.label = 5;
                        case 5:
                            if (!(_b < updates_2.length)) return [3 /*break*/, 8];
                            update = updates_2[_b];
                            if (!(update.value !== undefined)) return [3 /*break*/, 7];
                            return [4 /*yield*/, fastify.prisma.systemSetting.upsert({
                                    where: { key: update.key },
                                    update: { value: update.value, updated_at: new Date() },
                                    create: { key: update.key, value: update.value }
                                })];
                        case 6:
                            _q.sent();
                            _q.label = 7;
                        case 7:
                            _b++;
                            return [3 /*break*/, 5];
                        case 8:
                            if (!notificationSettings) return [3 /*break*/, 12];
                            updates = [
                                { key: 'email_notifications', value: (_f = notificationSettings.emailNotifications) === null || _f === void 0 ? void 0 : _f.toString() },
                                { key: 'request_notifications', value: (_g = notificationSettings.requestNotifications) === null || _g === void 0 ? void 0 : _g.toString() },
                                { key: 'event_notifications', value: (_h = notificationSettings.eventNotifications) === null || _h === void 0 ? void 0 : _h.toString() },
                                { key: 'budget_alerts', value: (_j = notificationSettings.budgetAlerts) === null || _j === void 0 ? void 0 : _j.toString() },
                                { key: 'system_alerts', value: (_k = notificationSettings.systemAlerts) === null || _k === void 0 ? void 0 : _k.toString() },
                                { key: 'weekly_reports', value: (_l = notificationSettings.weeklyReports) === null || _l === void 0 ? void 0 : _l.toString() }
                            ];
                            _c = 0, updates_3 = updates;
                            _q.label = 9;
                        case 9:
                            if (!(_c < updates_3.length)) return [3 /*break*/, 12];
                            update = updates_3[_c];
                            if (!(update.value !== undefined)) return [3 /*break*/, 11];
                            return [4 /*yield*/, fastify.prisma.systemSetting.upsert({
                                    where: { key: update.key },
                                    update: { value: update.value, updated_at: new Date() },
                                    create: { key: update.key, value: update.value }
                                })];
                        case 10:
                            _q.sent();
                            _q.label = 11;
                        case 11:
                            _c++;
                            return [3 /*break*/, 9];
                        case 12:
                            if (!securitySettings) return [3 /*break*/, 16];
                            updates = [
                                { key: 'two_factor_auth', value: (_m = securitySettings.twoFactorAuth) === null || _m === void 0 ? void 0 : _m.toString() },
                                { key: 'session_timeout', value: securitySettings.sessionTimeout },
                                { key: 'password_expiry', value: securitySettings.passwordExpiry },
                                { key: 'login_attempts', value: securitySettings.loginAttempts },
                                { key: 'ip_whitelist', value: (_o = securitySettings.ipWhitelist) === null || _o === void 0 ? void 0 : _o.toString() },
                                { key: 'audit_logging', value: (_p = securitySettings.auditLogging) === null || _p === void 0 ? void 0 : _p.toString() }
                            ];
                            _d = 0, updates_4 = updates;
                            _q.label = 13;
                        case 13:
                            if (!(_d < updates_4.length)) return [3 /*break*/, 16];
                            update = updates_4[_d];
                            if (!(update.value !== undefined)) return [3 /*break*/, 15];
                            return [4 /*yield*/, fastify.prisma.systemSetting.upsert({
                                    where: { key: update.key },
                                    update: { value: update.value, updated_at: new Date() },
                                    create: { key: update.key, value: update.value }
                                })];
                        case 14:
                            _q.sent();
                            _q.label = 15;
                        case 15:
                            _d++;
                            return [3 /*break*/, 13];
                        case 16: return [2 /*return*/, reply.send({
                                success: true,
                                message: 'Settings updated successfully'
                            })];
                        case 17:
                            error_4 = _q.sent();
                            fastify.log.error('Update system settings error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 18: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var allUsers, users, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, fastify.prisma.user.findMany({
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
                                })];
                        case 1:
                            allUsers = _a.sent();
                            users = allUsers.map(function (user) { return ({
                                id: user.id,
                                name: user.name || 'Unknown',
                                email: user.email,
                                role: user.role === 'ADMIN' ? 'Super Admin' : 'Startup',
                                status: user.status === 'APPROVED' ? 'Active' : 'Inactive',
                                lastLogin: user.updated_at.toISOString(),
                                createdDate: user.created_at.toISOString().split('T')[0]
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: users
                                })];
                        case 2:
                            error_5 = _a.sent();
                            fastify.log.error('Get admin users error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var uptime, uptimeDays, uptimeHours, systemInfo;
                return __generator(this, function (_a) {
                    try {
                        uptime = process.uptime();
                        uptimeDays = Math.floor(uptime / (24 * 60 * 60));
                        uptimeHours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
                        systemInfo = {
                            platformVersion: 'v2.1.0',
                            databaseVersion: 'PostgreSQL 14.2',
                            serverUptime: "".concat(uptimeDays, " days, ").concat(uptimeHours, " hours"),
                            lastBackup: '2 hours ago'
                        };
                        return [2 /*return*/, reply.send({
                                success: true,
                                data: systemInfo
                            })];
                    }
                    catch (error) {
                        fastify.log.error('Get system info error:', error);
                        return [2 /*return*/, reply.code(500).send({
                                success: false,
                                message: 'Internal server error'
                            })];
                    }
                    return [2 /*return*/];
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var settings, settingsMap, _i, settingsMap_3, setting, error_6;
                var _a, _b, _c, _d, _e, _f, _g;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            _h.trys.push([0, 5, , 6]);
                            settings = request.body;
                            settingsMap = [
                                { key: 'site_name', value: settings.appName },
                                { key: 'default_budget', value: (_a = settings.defaultBudget) === null || _a === void 0 ? void 0 : _a.toString() },
                                { key: 'max_file_size', value: (_b = settings.maxFileSize) === null || _b === void 0 ? void 0 : _b.toString() },
                                { key: 'allowed_file_types', value: settings.allowedFileTypes },
                                { key: 'smtp_server', value: settings.smtpServer },
                                { key: 'smtp_port', value: (_c = settings.smtpPort) === null || _c === void 0 ? void 0 : _c.toString() },
                                { key: 'smtp_username', value: settings.smtpUser },
                                { key: 'smtp_password', value: settings.smtpPassword },
                                { key: 'auto_approval', value: (_d = settings.autoApproval) === null || _d === void 0 ? void 0 : _d.toString() },
                                { key: 'maintenance_mode', value: (_e = settings.maintenanceMode) === null || _e === void 0 ? void 0 : _e.toString() },
                                { key: 'analytics_enabled', value: (_f = settings.analyticsEnabled) === null || _f === void 0 ? void 0 : _f.toString() },
                                { key: 'email_notifications', value: (_g = settings.notificationsEnabled) === null || _g === void 0 ? void 0 : _g.toString() }
                            ];
                            _i = 0, settingsMap_3 = settingsMap;
                            _h.label = 1;
                        case 1:
                            if (!(_i < settingsMap_3.length)) return [3 /*break*/, 4];
                            setting = settingsMap_3[_i];
                            if (!(setting.value !== undefined)) return [3 /*break*/, 3];
                            return [4 /*yield*/, fastify.prisma.systemSetting.upsert({
                                    where: { key: setting.key },
                                    update: {
                                        value: setting.value,
                                        updated_at: new Date()
                                    },
                                    create: {
                                        key: setting.key,
                                        value: setting.value,
                                        description: "Updated via settings page"
                                    }
                                })];
                        case 2:
                            _h.sent();
                            _h.label = 3;
                        case 3:
                            _i++;
                            return [3 /*break*/, 1];
                        case 4: return [2 /*return*/, reply.send({
                                success: true,
                                message: 'Settings updated successfully'
                            })];
                        case 5:
                            error_6 = _h.sent();
                            fastify.log.error('Update all settings error:', error_6);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, role, dbRole, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = request.params.id;
                            role = request.body.role;
                            dbRole = role === 'admin' ? 'ADMIN' : 'STARTUP';
                            return [4 /*yield*/, fastify.prisma.user.update({
                                    where: { id: id },
                                    data: {
                                        role: dbRole,
                                        updated_at: new Date()
                                    }
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'User role updated successfully'
                                })];
                        case 2:
                            error_7 = _a.sent();
                            fastify.log.error('Update user role error:', error_7);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
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
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var id, status_1, dbStatus, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            id = request.params.id;
                            status_1 = request.body.status;
                            dbStatus = status_1 === 'active' ? 'APPROVED' : 'INACTIVE';
                            return [4 /*yield*/, fastify.prisma.user.update({
                                    where: { id: id },
                                    data: {
                                        status: dbStatus,
                                        updated_at: new Date()
                                    }
                                })];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'User status updated successfully'
                                })];
                        case 2:
                            error_8 = _a.sent();
                            fastify.log.error('Update user status error:', error_8);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
};
