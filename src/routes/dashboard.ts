import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Authentication middleware
async function authenticateAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return reply.code(403).send({
        success: false,
        message: 'Admin access required'
      });
    }

    // Add user info to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.code(401).send({
      success: false,
      message: 'Invalid token'
    });
  }
}

// User authentication middleware
async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Add user info to request
    (request as any).user = decoded;
  } catch (error) {
    return reply.code(401).send({
      success: false,
      message: 'Invalid token'
    });
  }
}

/**
 * Dashboard routes for admin statistics
 */
module.exports = async function (fastify: FastifyInstance) {
  
  // Get admin dashboard overview statistics
  fastify.get('/dashboard/overview', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get admin dashboard overview statistics',
      description: 'Get aggregated statistics for admin dashboard',
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
                totalStartups: { type: 'number' },
                activeFounders: { type: 'number' },
                totalBudgetAllocated: { type: 'number' },
                totalBudgetUsed: { type: 'number' },
                budgetUsagePercentage: { type: 'number' },
                pendingRequests: { type: 'number' },
                upcomingEvents: { type: 'number' },
                resourcesUploaded: { type: 'number' },
                questionnairesCompleted: { type: 'number' }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get total startups
      const totalStartups = await fastify.prisma.startup.count();

      // Get active founders (users with approved status)
      const activeFounders = await fastify.prisma.user.count({
        where: {
          role: 'STARTUP',
          status: 'APPROVED'
        }
      });

      // Get budget statistics
      const budgetStats = await fastify.prisma.startupBudget.aggregate({
        _sum: {
          total_budget: true,
          used_budget: true
        }
      });

      const totalBudgetAllocated = Number(budgetStats._sum.total_budget || 0);
      const totalBudgetUsed = Number(budgetStats._sum.used_budget || 0);
      const budgetUsagePercentage = totalBudgetAllocated > 0 
        ? Math.round((totalBudgetUsed / totalBudgetAllocated) * 100) 
        : 0;

      // Get pending budget requests
      const pendingRequests = await fastify.prisma.budgetRequest.count({
        where: {
          status: 'PENDING'
        }
      });

      // Get upcoming events (events with future dates)
      const upcomingEvents = await fastify.prisma.event.count({
        where: {
          date: {
            gte: new Date()
          },
          status: {
            in: ['UPCOMING', 'DRAFT']
          }
        }
      });

      // Get total resources uploaded
      const resourcesUploaded = await fastify.prisma.resource.count();

      // Get completed questionnaires (suivi responses)
      const questionnairesCompleted = await fastify.prisma.suiviResponse.count();

      return reply.send({
        success: true,
        data: {
          totalStartups,
          activeFounders,
          totalBudgetAllocated,
          totalBudgetUsed,
          budgetUsagePercentage,
          pendingRequests,
          upcomingEvents,
          resourcesUploaded,
          questionnairesCompleted
        }
      });

    } catch (error) {
      fastify.log.error('Dashboard overview error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get recent activity for dashboard
  fastify.get('/dashboard/activity', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get recent activity for admin dashboard',
      description: 'Get recent activities across the platform',
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
          limit: { type: 'number', default: 10 }
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
                  type: { type: 'string' },
                  user: { type: 'string' },
                  action: { type: 'string' },
                  amount: { type: 'number' },
                  details: { type: 'string' },
                  time: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    const query = request.query as { limit?: number };
    try {
      const limit = query.limit || 10;
      const activities: any[] = [];

      // Get recent budget requests
      const recentRequests = await fastify.prisma.budgetRequest.findMany({
        take: Math.floor(limit / 2),
        orderBy: { created_at: 'desc' },
        include: {
          startup: { select: { company_name: true } },
          user: { select: { name: true } }
        }
      });

      recentRequests.forEach(request => {
        activities.push({
          id: `request-${request.id}`,
          type: 'request',
          user: request.startup.company_name,
          action: 'submitted budget request',
          amount: Number(request.amount),
          details: request.category,
          time: formatTimeAgo(request.created_at),
          status: request.status.toLowerCase()
        });
      });

      // Get recent events
      const recentEvents = await fastify.prisma.event.findMany({
        take: Math.floor(limit / 4),
        orderBy: { created_at: 'desc' }
      });

      recentEvents.forEach(event => {
        activities.push({
          id: `event-${event.id}`,
          type: 'event',
          user: 'Admin',
          action: 'created new event',
          details: event.title,
          time: formatTimeAgo(event.created_at),
          status: 'active'
        });
      });

      // Get recent resources
      const recentResources = await fastify.prisma.resource.findMany({
        take: Math.floor(limit / 4),
        orderBy: { created_at: 'desc' },
        include: {
          uploader: { select: { name: true } }
        }
      });

      recentResources.forEach(resource => {
        activities.push({
          id: `resource-${resource.id}`,
          type: 'resource',
          user: resource.uploader.name || 'Admin',
          action: 'uploaded new resource',
          details: resource.title,
          time: formatTimeAgo(resource.created_at),
          status: 'active'
        });
      });

      // Sort all activities by time (most recent first)
      activities.sort((a, b) => {
        // Convert time ago to sortable format (this is simplified)
        return b.id.localeCompare(a.id);
      });

      return reply.send({
        success: true,
        data: activities.slice(0, limit)
      });

    } catch (error) {
      fastify.log.error('Dashboard activity error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get system health status
  fastify.get('/dashboard/health', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get system health status',
      description: 'Get system health indicators for admin dashboard',
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
                database: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    responseTime: { type: 'number' }
                  }
                },
                api: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    uptime: { type: 'number' }
                  }
                },
                storage: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    usage: { type: 'number' }
                  }
                }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Test database connection
      const dbStart = Date.now();
      await fastify.prisma.$queryRaw`SELECT 1`;
      const dbResponseTime = Date.now() - dbStart;

      // Mock storage usage (in production, you'd get this from your storage provider)
      const storageUsage = Math.floor(Math.random() * 30) + 60; // 60-90% usage

      return reply.send({
        success: true,
        data: {
          database: {
            status: 'healthy',
            responseTime: dbResponseTime
          },
          api: {
            status: 'healthy',
            uptime: process.uptime()
          },
          storage: {
            status: storageUsage > 85 ? 'warning' : 'healthy',
            usage: storageUsage
          }
        }
      });

    } catch (error) {
      fastify.log.error('Dashboard health error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get user dashboard data
  fastify.get('/dashboard/user', {
    schema: {
      tags: ['Dashboard'],
      summary: 'Get user dashboard data',
      description: 'Get dashboard data for authenticated startup user',
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: { type: 'string' }
        }
      }
    },
    preHandler: authenticateUser
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = (request as any).user;
      console.log('User from JWT:', user.id, user.email);
      
      if (!user) {
        return reply.code(401).send({
          success: false,
          message: 'No user found in JWT token'
        });
      }
      
      // Get user's startup
      const startup = await (fastify as any).prisma.startup.findFirst({
        where: { user_id: user.id }
      });
      
      if (!startup) {
        return reply.send({
          success: true,
          data: {
            budget: {
              total: 0,
              used: 0,
              remaining: 0,
              categories: []
            },
            recentRequests: [],
            upcomingEvents: [],
            recentResources: [],
            suiviForms: {
              pendingForms: [],
              completedThisQuarter: 0
            }
          }
        });
      }

      // Get budget data
      const budget = await (fastify as any).prisma.startupBudget.findFirst({
        where: { startup_id: startup.id }
      });

      // Get budget categories
      const categories = await (fastify as any).prisma.budgetCategory.findMany({
        where: { startup_id: startup.id }
      });
      
      const budgetData = {
        total: Number(budget?.total_budget || 0),
        used: Number(budget?.used_budget || 0),
        remaining: Number(budget?.total_budget || 0) - Number(budget?.used_budget || 0),
        categories: categories.map((cat: any) => ({
          name: cat.name,
          budget: Number(cat.budget_allocated),
          used: Number(cat.budget_used),
          color: cat.color || getCategoryColor(cat.name),
          percentage: Number(cat.budget_allocated) > 0 ? Math.round((Number(cat.budget_used) / Number(cat.budget_allocated)) * 100) : 0
        }))
      };

      // Get recent requests
      const recentRequests = await (fastify as any).prisma.budgetRequest.findMany({
        where: { 
          startup_id: startup.id 
        },
        orderBy: { created_at: 'desc' },
        take: 3
      });

      // Get upcoming events
      const upcomingEvents = await (fastify as any).prisma.event.findMany({
        where: {
          date: {
            gte: new Date()
          },
          status: {
            in: ['UPCOMING', 'DRAFT']
          }
        },
        orderBy: { date: 'asc' },
        take: 4
      });

      // Get recent resources
      const recentResources = await (fastify as any).prisma.resource.findMany({
        where: {
          is_public: true
        },
        orderBy: { created_at: 'desc' },
        take: 3
      });

      // Get active suivi forms that the user hasn't completed recently
      const activeForms = await (fastify as any).prisma.suiviForm.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          questions: {
            orderBy: {
              order_index: 'asc'
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Get user's recent responses to check which forms are pending
      const now = new Date();
      const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      
      const userResponses = await (fastify as any).prisma.suiviResponse.findMany({
        where: {
          user_id: user.id,
          submitted_at: {
            gte: quarterStart
          }
        },
        select: {
          form_id: true,
          submitted_at: true
        }
      });

      // Calculate completed forms this quarter
      const completedThisQuarter = userResponses.length;

      // Determine pending forms based on frequency and last completion
      const pendingForms = activeForms.filter((form: any) => {
        const lastResponse = userResponses.find((r: any) => r.form_id === form.id);
        
        if (!lastResponse) {
          return true; // Never completed, so it's pending
        }

        const lastCompleted = new Date(lastResponse.submitted_at);
        const daysSinceCompleted = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));

        // Check if form is due based on frequency
        switch (form.frequency) {
          case 'WEEKLY':
            return daysSinceCompleted >= 7;
          case 'MONTHLY':
            return daysSinceCompleted >= 30;
          case 'QUARTERLY':
            return daysSinceCompleted >= 90;
          case 'INSTANT':
            return true; // Always available
          default:
            return false;
        }
      }).slice(0, 2); // Limit to 2 pending forms for dashboard

      const suiviFormsData = {
        pendingForms: pendingForms.map((form: any) => {
          const estimatedTime = form.questions.length * 1.5; // Rough estimate: 1.5 minutes per question
          const dueDate = new Date();
          
          // Calculate due date based on frequency
          switch (form.frequency) {
            case 'WEEKLY':
              dueDate.setDate(dueDate.getDate() + 1);
              break;
            case 'MONTHLY':
              dueDate.setDate(dueDate.getDate() + 3);
              break;
            case 'QUARTERLY':
              dueDate.setDate(dueDate.getDate() + 7);
              break;
            case 'INSTANT':
              dueDate.setHours(dueDate.getHours() + 1);
              break;
          }

          return {
            id: form.id,
            title: form.title,
            description: form.description,
            frequency: form.frequency.toLowerCase(),
            questionCount: form.questions.length,
            estimatedTime: Math.max(3, Math.round(estimatedTime)), // Minimum 3 minutes
            dueDate: dueDate.toISOString(),
            status: 'pending'
          };
        }),
        completedThisQuarter
      };

      return reply.send({
        success: true,
        data: {
          budget: budgetData,
          recentRequests: recentRequests.map((req: any) => ({
            id: req.id,
            title: req.description,
            date: req.created_at.toISOString().split('T')[0],
            status: req.status,
            category: req.category,
            amount: `$${Number(req.amount).toLocaleString()}`
          })),
          upcomingEvents: upcomingEvents.map((event: any) => ({
            id: event.id,
            title: event.title,
            date: event.date.toISOString().split('T')[0],
            time: event.time,
            type: event.type,
            status: event.status,
            participants: event.current_attendees || 0,
            maxParticipants: event.max_attendees || 0
          })),
          recentResources: recentResources.map((resource: any) => ({
            id: resource.id,
            title: resource.title,
            category: resource.category,
            type: resource.type,
            size: resource.file_size || 'N/A',
            downloads: resource.download_count || 0
          })),
          suiviForms: suiviFormsData
        }
      });

    } catch (error) {
      console.error('❌ User dashboard error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
};

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Cloud': '#94182C',
    'Marketing': '#dc2626',
    'IT': '#7c2d12',
    'Expos': '#991b1b',
    'Events': '#991b1b',
    'Freelances': '#b91c1c',
    'Training': '#059669',
    'Infrastructure': '#0d9488',
    'Tools': '#0891b2',
    'Other': '#6b7280'
  };
  return colors[category] || '#6b7280';
}