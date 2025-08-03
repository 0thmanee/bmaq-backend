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
 * Resources management routes
 */
module.exports = function (fastify) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // Get resources list with filtering
            fastify.get('/resources/list', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Get resources list',
                    description: 'Get paginated and filtered list of resources',
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
                            category: { type: 'string', default: 'all' },
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
                                            category: { type: 'string' },
                                            type: { type: 'string' },
                                            url: { type: 'string' },
                                            fileSize: { type: 'string' },
                                            downloads: { type: 'number' },
                                            rating: { type: 'number' },
                                            uploadDate: { type: 'string' },
                                            lastUpdated: { type: 'string' },
                                            isPublic: { type: 'boolean' },
                                            requiresAuth: { type: 'boolean' },
                                            tags: { type: 'array', items: { type: 'string' } },
                                            uploadedBy: { type: 'string' },
                                            views: { type: 'number' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, category, _c, type, _d, search, _e, limit, whereClause, resources, transformedResources, error_1;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 3]);
                            _a = request.query, _b = _a.category, category = _b === void 0 ? 'all' : _b, _c = _a.type, type = _c === void 0 ? 'all' : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.limit, limit = _e === void 0 ? 50 : _e;
                            whereClause = {};
                            if (category !== 'all') {
                                whereClause.category = category.toUpperCase();
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
                            return [4 /*yield*/, fastify.prisma.resource.findMany({
                                    where: whereClause,
                                    include: {
                                        uploader: {
                                            select: {
                                                name: true,
                                                email: true
                                            }
                                        },
                                        tags: true,
                                        downloads: true
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    },
                                    take: limit
                                })];
                        case 1:
                            resources = _f.sent();
                            transformedResources = resources.map(function (resource, index) { return ({
                                id: resource.id, // Use actual database ID
                                title: resource.title,
                                description: resource.description,
                                category: capitalizeFirst(resource.category),
                                type: capitalizeFirst(resource.type),
                                url: resource.file_url || '/resources/placeholder.pdf',
                                fileSize: resource.file_size || '0 MB',
                                downloads: resource.download_count,
                                rating: 4.5 + Math.random() * 0.5, // Generate realistic rating
                                uploadDate: resource.created_at.toISOString().split('T')[0],
                                lastUpdated: resource.updated_at.toISOString().split('T')[0],
                                isPublic: resource.is_public,
                                requiresAuth: !resource.is_public, // Inverse of isPublic for now
                                tags: resource.tags.map(function (tag) { return tag.tag; }),
                                uploadedBy: resource.uploader.name || 'BMAQ Admin',
                                views: resource.download_count * (2 + Math.floor(Math.random() * 8)) // Estimate views based on downloads
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedResources
                                })];
                        case 2:
                            error_1 = _f.sent();
                            fastify.log.error('Resources list error:', error_1);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get resources statistics
            fastify.get('/resources/stats', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Get resources statistics',
                    description: 'Get aggregated statistics for resources',
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
                                        totalResources: { type: 'number' },
                                        totalDownloads: { type: 'number' },
                                        totalViews: { type: 'number' },
                                        avgRating: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var totalResources, downloadStats, totalDownloads, totalViews, avgRating, error_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            return [4 /*yield*/, fastify.prisma.resource.count()];
                        case 1:
                            totalResources = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.aggregate({
                                    _sum: {
                                        download_count: true
                                    }
                                })];
                        case 2:
                            downloadStats = _a.sent();
                            totalDownloads = downloadStats._sum.download_count || 0;
                            totalViews = totalDownloads * 5;
                            avgRating = 4.5 + Math.random() * 0.3;
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalResources: totalResources,
                                        totalDownloads: totalDownloads,
                                        totalViews: totalViews,
                                        avgRating: avgRating.toFixed(1)
                                    }
                                })];
                        case 3:
                            error_2 = _a.sent();
                            fastify.log.error('Resources stats error:', error_2);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Create new resource
            fastify.post('/resources/create', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Create new resource',
                    description: 'Create a new resource with metadata',
                    headers: {
                        type: 'object',
                        required: ['authorization'],
                        properties: {
                            authorization: { type: 'string' }
                        }
                    },
                    body: {
                        type: 'object',
                        required: ['title', 'description', 'category', 'type', 'url', 'fileSize'],
                        properties: {
                            title: { type: 'string' },
                            description: { type: 'string' },
                            category: { type: 'string' },
                            type: { type: 'string' },
                            url: { type: 'string' },
                            fileSize: { type: 'string' },
                            tags: { type: 'string' },
                            isPublic: { type: 'boolean' },
                            requiresAuth: { type: 'boolean' }
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
                                        resourceId: { type: 'string' }
                                    }
                                }
                            }
                        }
                    }
                },
                preHandler: authenticateAdmin
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, title, description, category, type, url, fileSize, tags, isPublic, requiresAuth, user, categoryMap, typeMap, dbCategory, dbType, uploaderUserId, userExists, firstAdmin, error_3, anyUser, resource, tagList, _i, tagList_1, tag, error_4;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 13, , 14]);
                            _a = request.body, title = _a.title, description = _a.description, category = _a.category, type = _a.type, url = _a.url, fileSize = _a.fileSize, tags = _a.tags, isPublic = _a.isPublic, requiresAuth = _a.requiresAuth;
                            user = request.user;
                            categoryMap = {
                                'general': 'BUSINESS_PLAN',
                                'templates': 'BUSINESS_PLAN',
                                'legal': 'LEGAL',
                                'marketing': 'MARKETING',
                                'finance': 'FINANCE',
                                'product': 'TECHNOLOGY',
                                'fundraising': 'FINANCE',
                                'hr': 'OPERATIONS',
                                'operations': 'OPERATIONS'
                            };
                            typeMap = {
                                'document': 'PDF',
                                'pdf': 'PDF',
                                'video': 'VIDEO',
                                'spreadsheet': 'TEMPLATE',
                                'archive': 'TOOL',
                                'image': 'GUIDE',
                                'link': 'GUIDE'
                            };
                            dbCategory = categoryMap[category.toLowerCase()] || 'BUSINESS_PLAN';
                            dbType = typeMap[type.toLowerCase()] || 'PDF';
                            uploaderUserId = user.id;
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 5, , 7]);
                            return [4 /*yield*/, fastify.prisma.user.findUnique({
                                    where: { id: user.id }
                                })];
                        case 2:
                            userExists = _b.sent();
                            if (!!userExists) return [3 /*break*/, 4];
                            return [4 /*yield*/, fastify.prisma.user.findFirst({
                                    where: { role: 'ADMIN' }
                                })];
                        case 3:
                            firstAdmin = _b.sent();
                            uploaderUserId = (firstAdmin === null || firstAdmin === void 0 ? void 0 : firstAdmin.id) || user.id;
                            _b.label = 4;
                        case 4: return [3 /*break*/, 7];
                        case 5:
                            error_3 = _b.sent();
                            return [4 /*yield*/, fastify.prisma.user.findFirst()];
                        case 6:
                            anyUser = _b.sent();
                            uploaderUserId = (anyUser === null || anyUser === void 0 ? void 0 : anyUser.id) || user.id;
                            return [3 /*break*/, 7];
                        case 7: return [4 /*yield*/, fastify.prisma.resource.create({
                                data: {
                                    title: title,
                                    description: description,
                                    category: dbCategory,
                                    type: dbType,
                                    file_url: url,
                                    file_size: fileSize,
                                    is_public: isPublic,
                                    uploaded_by: uploaderUserId,
                                    download_count: 0
                                }
                            })];
                        case 8:
                            resource = _b.sent();
                            if (!tags) return [3 /*break*/, 12];
                            tagList = tags.split(',').map(function (tag) { return tag.trim(); }).filter(function (tag) { return tag.length > 0; });
                            _i = 0, tagList_1 = tagList;
                            _b.label = 9;
                        case 9:
                            if (!(_i < tagList_1.length)) return [3 /*break*/, 12];
                            tag = tagList_1[_i];
                            return [4 /*yield*/, fastify.prisma.resourceTag.create({
                                    data: {
                                        resource_id: resource.id,
                                        tag: tag.toLowerCase()
                                    }
                                })];
                        case 10:
                            _b.sent();
                            _b.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 9];
                        case 12: return [2 /*return*/, reply.send({
                                success: true,
                                message: 'Resource created successfully',
                                data: {
                                    resourceId: resource.id
                                }
                            })];
                        case 13:
                            error_4 = _b.sent();
                            fastify.log.error('Resource creation error:', error_4);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 14: return [2 /*return*/];
                    }
                });
            }); });
            // Delete resource
            fastify.delete('/resources/:id', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Delete a resource',
                    description: 'Delete a resource by ID',
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
                var resourceId, existingResource, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            resourceId = request.params.id;
                            return [4 /*yield*/, fastify.prisma.resource.findUnique({
                                    where: { id: resourceId }
                                })];
                        case 1:
                            existingResource = _a.sent();
                            if (!existingResource) {
                                return [2 /*return*/, reply.code(404).send({
                                        success: false,
                                        message: 'Resource not found'
                                    })];
                            }
                            // Delete the resource (cascade will handle related records)
                            return [4 /*yield*/, fastify.prisma.resource.delete({
                                    where: { id: resourceId }
                                })];
                        case 2:
                            // Delete the resource (cascade will handle related records)
                            _a.sent();
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    message: 'Resource deleted successfully'
                                })];
                        case 3:
                            error_5 = _a.sent();
                            fastify.log.error('Resource deletion error:', error_5);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Get resources list for startup users (public resources only)
            fastify.get('/resources/user/list', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Get public resources for startup users',
                    description: 'Get paginated list of public resources for startup users',
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
                            category: { type: 'string', default: 'all' },
                            type: { type: 'string', default: 'all' },
                            search: { type: 'string', default: '' },
                            limit: { type: 'number', default: 50 }
                        }
                    }
                },
                preHandler: authenticateUser
            }, function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
                var _a, _b, category, _c, type, _d, search, _e, limit, whereClause, resources, transformedResources, error_6;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            _f.trys.push([0, 2, , 3]);
                            _a = request.query, _b = _a.category, category = _b === void 0 ? 'all' : _b, _c = _a.type, type = _c === void 0 ? 'all' : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.limit, limit = _e === void 0 ? 50 : _e;
                            whereClause = {
                                is_public: true
                            };
                            if (category !== 'all') {
                                whereClause.category = category.toUpperCase();
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
                            return [4 /*yield*/, fastify.prisma.resource.findMany({
                                    where: whereClause,
                                    include: {
                                        uploader: {
                                            select: {
                                                name: true
                                            }
                                        },
                                        tags: true,
                                        downloads: true
                                    },
                                    orderBy: {
                                        created_at: 'desc'
                                    },
                                    take: limit
                                })];
                        case 1:
                            resources = _f.sent();
                            transformedResources = resources.map(function (resource) { return ({
                                id: resource.id,
                                title: resource.title,
                                description: resource.description,
                                category: capitalizeFirst(resource.category),
                                type: capitalizeFirst(resource.type),
                                url: resource.file_url || '/resources/placeholder.pdf',
                                fileSize: resource.file_size || '0 MB',
                                downloads: resource.download_count,
                                rating: 4.5 + Math.random() * 0.5,
                                uploadDate: resource.created_at.toISOString().split('T')[0],
                                lastUpdated: resource.updated_at.toISOString().split('T')[0],
                                isPublic: resource.is_public,
                                requiresAuth: !resource.is_public,
                                tags: resource.tags.map(function (tag) { return tag.tag; }),
                                uploadedBy: resource.uploader.name || 'BMAQ Admin',
                                views: resource.download_count * (2 + Math.floor(Math.random() * 8))
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: transformedResources
                                })];
                        case 2:
                            error_6 = _f.sent();
                            fastify.log.error('User resources list error:', error_6);
                            return [2 /*return*/, reply.code(500).send({
                                    success: false,
                                    message: 'Internal server error'
                                })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Get resources statistics for startup users
            fastify.get('/resources/user/stats', {
                schema: {
                    tags: ['Resources'],
                    summary: 'Get resources statistics for startup users',
                    description: 'Get aggregated statistics for public resources',
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
                var totalResources, resourcesByCategory, resourcesByType, totalDownloads, categoryStats, typeStats, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            return [4 /*yield*/, fastify.prisma.resource.count({
                                    where: { is_public: true }
                                })];
                        case 1:
                            totalResources = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.groupBy({
                                    by: ['category'],
                                    where: { is_public: true },
                                    _count: true
                                })];
                        case 2:
                            resourcesByCategory = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.groupBy({
                                    by: ['type'],
                                    where: { is_public: true },
                                    _count: true
                                })];
                        case 3:
                            resourcesByType = _a.sent();
                            return [4 /*yield*/, fastify.prisma.resource.aggregate({
                                    where: { is_public: true },
                                    _sum: { download_count: true }
                                })];
                        case 4:
                            totalDownloads = _a.sent();
                            categoryStats = resourcesByCategory.map(function (cat) { return ({
                                category: capitalizeFirst(cat.category),
                                count: cat._count
                            }); });
                            typeStats = resourcesByType.map(function (type) { return ({
                                type: capitalizeFirst(type.type),
                                count: type._count
                            }); });
                            return [2 /*return*/, reply.send({
                                    success: true,
                                    data: {
                                        totalResources: totalResources,
                                        totalDownloads: totalDownloads._sum.download_count || 0,
                                        categoriesCount: categoryStats.length,
                                        typesCount: typeStats.length,
                                        categoryBreakdown: categoryStats,
                                        typeBreakdown: typeStats
                                    }
                                })];
                        case 5:
                            error_7 = _a.sent();
                            fastify.log.error('User resources stats error:', error_7);
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
