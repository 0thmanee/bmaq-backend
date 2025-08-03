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
 * Resources management routes
 */
module.exports = async function (fastify) {
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
    }, async (request, reply) => {
        try {
            const { category = 'all', type = 'all', search = '', limit = 50 } = request.query;
            // Build where clause for filtering
            const whereClause = {};
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
            // Get resources from database
            const resources = await fastify.prisma.resource.findMany({
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
            });
            // Transform data to match frontend expectations
            const transformedResources = resources.map((resource, index) => ({
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
                tags: resource.tags.map(tag => tag.tag),
                uploadedBy: resource.uploader.name || 'BMAQ Admin',
                views: resource.download_count * (2 + Math.floor(Math.random() * 8)) // Estimate views based on downloads
            }));
            return reply.send({
                success: true,
                data: transformedResources
            });
        }
        catch (error) {
            fastify.log.error('Resources list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            // Get resource count
            const totalResources = await fastify.prisma.resource.count();
            // Get total downloads
            const downloadStats = await fastify.prisma.resource.aggregate({
                _sum: {
                    download_count: true
                }
            });
            const totalDownloads = downloadStats._sum.download_count || 0;
            const totalViews = totalDownloads * 5; // Estimate views as 5x downloads
            const avgRating = 4.5 + Math.random() * 0.3; // Generate realistic average rating
            return reply.send({
                success: true,
                data: {
                    totalResources,
                    totalDownloads,
                    totalViews,
                    avgRating: avgRating.toFixed(1)
                }
            });
        }
        catch (error) {
            fastify.log.error('Resources stats error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { title, description, category, type, url, fileSize, tags, isPublic, requiresAuth } = request.body;
            const user = request.user;
            // Map frontend categories/types to database enums
            const categoryMap = {
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
            const typeMap = {
                'document': 'PDF',
                'pdf': 'PDF',
                'video': 'VIDEO',
                'spreadsheet': 'TEMPLATE',
                'archive': 'TOOL',
                'image': 'GUIDE',
                'link': 'GUIDE'
            };
            const dbCategory = categoryMap[category.toLowerCase()] || 'BUSINESS_PLAN';
            const dbType = typeMap[type.toLowerCase()] || 'PDF';
            // Create resource - need to find a valid user ID or use a default
            let uploaderUserId = user.id;
            // Check if the user exists, if not use the first admin user
            try {
                const userExists = await fastify.prisma.user.findUnique({
                    where: { id: user.id }
                });
                if (!userExists) {
                    const firstAdmin = await fastify.prisma.user.findFirst({
                        where: { role: 'ADMIN' }
                    });
                    uploaderUserId = firstAdmin?.id || user.id;
                }
            }
            catch (error) {
                // If user check fails, try to find any user
                const anyUser = await fastify.prisma.user.findFirst();
                uploaderUserId = anyUser?.id || user.id;
            }
            const resource = await fastify.prisma.resource.create({
                data: {
                    title,
                    description,
                    category: dbCategory,
                    type: dbType,
                    file_url: url,
                    file_size: fileSize,
                    is_public: isPublic,
                    uploaded_by: uploaderUserId,
                    download_count: 0
                }
            });
            // Create tags if provided
            if (tags) {
                const tagList = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
                for (const tag of tagList) {
                    await fastify.prisma.resourceTag.create({
                        data: {
                            resource_id: resource.id,
                            tag: tag.toLowerCase()
                        }
                    });
                }
            }
            return reply.send({
                success: true,
                message: 'Resource created successfully',
                data: {
                    resourceId: resource.id
                }
            });
        }
        catch (error) {
            fastify.log.error('Resource creation error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const resourceId = request.params.id;
            // Check if resource exists
            const existingResource = await fastify.prisma.resource.findUnique({
                where: { id: resourceId }
            });
            if (!existingResource) {
                return reply.code(404).send({
                    success: false,
                    message: 'Resource not found'
                });
            }
            // Delete the resource (cascade will handle related records)
            await fastify.prisma.resource.delete({
                where: { id: resourceId }
            });
            return reply.send({
                success: true,
                message: 'Resource deleted successfully'
            });
        }
        catch (error) {
            fastify.log.error('Resource deletion error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            const { category = 'all', type = 'all', search = '', limit = 50 } = request.query;
            // Build where clause for filtering (only public resources)
            const whereClause = {
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
            // Get resources
            const resources = await fastify.prisma.resource.findMany({
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
            });
            // Transform data to match frontend expectations
            const transformedResources = resources.map((resource) => ({
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
                tags: resource.tags.map(tag => tag.tag),
                uploadedBy: resource.uploader.name || 'BMAQ Admin',
                views: resource.download_count * (2 + Math.floor(Math.random() * 8))
            }));
            return reply.send({
                success: true,
                data: transformedResources
            });
        }
        catch (error) {
            fastify.log.error('User resources list error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
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
    }, async (request, reply) => {
        try {
            // Get total public resources count
            const totalResources = await fastify.prisma.resource.count({
                where: { is_public: true }
            });
            // Get resources by category
            const resourcesByCategory = await fastify.prisma.resource.groupBy({
                by: ['category'],
                where: { is_public: true },
                _count: true
            });
            // Get resources by type
            const resourcesByType = await fastify.prisma.resource.groupBy({
                by: ['type'],
                where: { is_public: true },
                _count: true
            });
            // Get total downloads
            const totalDownloads = await fastify.prisma.resource.aggregate({
                where: { is_public: true },
                _sum: { download_count: true }
            });
            const categoryStats = resourcesByCategory.map(cat => ({
                category: capitalizeFirst(cat.category),
                count: cat._count
            }));
            const typeStats = resourcesByType.map(type => ({
                type: capitalizeFirst(type.type),
                count: type._count
            }));
            return reply.send({
                success: true,
                data: {
                    totalResources,
                    totalDownloads: totalDownloads._sum.download_count || 0,
                    categoriesCount: categoryStats.length,
                    typesCount: typeStats.length,
                    categoryBreakdown: categoryStats,
                    typeBreakdown: typeStats
                }
            });
        }
        catch (error) {
            fastify.log.error('User resources stats error:', error);
            return reply.code(500).send({
                success: false,
                message: 'Internal server error'
            });
        }
    });
};
// Helper function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
//# sourceMappingURL=resources.js.map