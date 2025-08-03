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

// Types for request bodies
interface ApprovalAction {
  action: 'approve' | 'reject';
  reason?: string;
}

/**
 * Startups management routes
 */
module.exports = async function (fastify: FastifyInstance) {
  
  // Get all startups with filtering
  fastify.get('/startups/list', {
    schema: {
      tags: ['Startups'],
      summary: 'Get all startups',
      description: 'Get list of startups with filtering options',
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
          status: { type: 'string', enum: ['all', 'pending', 'approved', 'rejected'] },
          industry: { type: 'string' },
          search: { type: 'string' },
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
                  user_id: { type: 'string' },
                  company_name: { type: 'string' },
                  description: { type: 'string' },
                  industry: { type: 'string' },
                  founded_year: { type: 'number' },
                  team_size: { type: 'string' },
                  website: { type: 'string' },
                  status: { type: 'string' },
                  created_at: { type: 'string' },
                  updated_at: { type: 'string' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' },
                      status: { type: 'string' },
                      created_at: { type: 'string' }
                    }
                  },
                  budget: {
                    type: 'object',
                    properties: {
                      total_budget: { type: 'number' },
                      used_budget: { type: 'number' },
                      remaining_budget: { type: 'number' }
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
      const { status, industry, search, limit = 50 } = request.query as { status?: string, industry?: string, search?: string, limit?: number };

      // Build where conditions
      const whereConditions: any = {};

      if (status && status !== 'all') {
        whereConditions.status = status.toUpperCase();
      }

      if (industry && industry !== 'all') {
        whereConditions.industry = industry;
      }

      if (search) {
        whereConditions.OR = [
          { company_name: { contains: search } },
          { description: { contains: search } },
          { user: { name: { contains: search } } },
          { user: { email: { contains: search } } }
        ];
      }

      // Get startups with related data
      const startups = await fastify.prisma.startup.findMany({
        where: whereConditions,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              created_at: true
            }
          },
          budget: {
            select: {
              total_budget: true,
              used_budget: true,
              remaining_budget: true
            }
          }
        },
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      });

      // Transform data to match frontend expectations
      const transformedStartups = startups.map(startup => ({
        id: startup.id,
        user_id: startup.user_id,
        company_name: startup.company_name,
        description: startup.description || '',
        industry: startup.industry || '',
        founded_year: startup.founded_year || new Date().getFullYear(),
        team_size: startup.team_size || '1-5',
        website: startup.website || '',
        status: startup.status.toLowerCase(),
        created_at: startup.created_at.toISOString(),
        updated_at: startup.updated_at.toISOString(),
        user: {
          id: startup.user.id,
          name: startup.user.name || 'Unknown',
          email: startup.user.email,
          status: startup.user.status.toLowerCase(),
          created_at: startup.user.created_at.toISOString()
        },
        budget: startup.budget ? {
          total_budget: Number(startup.budget.total_budget),
          used_budget: Number(startup.budget.used_budget),
          remaining_budget: Number(startup.budget.remaining_budget)
        } : undefined
      }));

      return reply.send({
        success: true,
        data: transformedStartups
      });

    } catch (error) {
      fastify.log.error('Get startups list error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get startup statistics
  fastify.get('/startups/stats', {
    schema: {
      tags: ['Startups'],
      summary: 'Get startup statistics',
      description: 'Get aggregated startup statistics for dashboard',
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
                total: { type: 'number' },
                pending: { type: 'number' },
                approved: { type: 'number' },
                rejected: { type: 'number' },
                totalBudget: { type: 'number' },
                usedBudget: { type: 'number' }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get total startups count
      const total = await fastify.prisma.startup.count();

      // Get startups by status
      const statusCounts = await fastify.prisma.startup.groupBy({
        by: ['status'],
        _count: {
          id: true
        }
      });

      let pending = 0, approved = 0, rejected = 0;
      statusCounts.forEach(status => {
        switch (status.status) {
          case 'PENDING':
            pending = status._count.id;
            break;
          case 'APPROVED':
            approved = status._count.id;
            break;
          case 'REJECTED':
            rejected = status._count.id;
            break;
        }
      });

      // Get budget totals
      const budgetStats = await fastify.prisma.startupBudget.aggregate({
        _sum: {
          total_budget: true,
          used_budget: true
        }
      });

      const totalBudget = Number(budgetStats._sum.total_budget || 0);
      const usedBudget = Number(budgetStats._sum.used_budget || 0);

      return reply.send({
        success: true,
        data: {
          total,
          pending,
          approved,
          rejected,
          totalBudget,
          usedBudget
        }
      });

    } catch (error) {
      fastify.log.error('Get startup stats error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Approve or reject startup
  fastify.post('/startups/:id/action', {
    schema: {
      tags: ['Startups'],
      summary: 'Approve or reject startup',
      description: 'Approve or reject a startup application',
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
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['approve', 'reject'] },
          reason: { type: 'string' }
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
      const { id } = request.params as { id: string };
      const { action, reason } = request.body as ApprovalAction;
      const user = (request as any).user;

      // Find the startup
      const startup = await fastify.prisma.startup.findUnique({
        where: { id },
        include: { user: true }
      });

      if (!startup) {
        return reply.code(404).send({
          success: false,
          message: 'Startup not found'
        });
      }

      if (action === 'approve') {
        // Update startup status to approved
        await fastify.prisma.startup.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approved_by: user.id,
            approved_at: new Date(),
            updated_at: new Date()
          }
        });

        // Update user status to approved
        await fastify.prisma.user.update({
          where: { id: startup.user_id },
          data: {
            status: 'APPROVED',
            updated_at: new Date()
          }
        });

        // Create default budget allocation
        const defaultBudget = 75000; // Default budget from system settings
        await fastify.prisma.startupBudget.upsert({
          where: { startup_id: id },
          update: {
            total_budget: defaultBudget,
            used_budget: 0,
            remaining_budget: defaultBudget,
            updated_at: new Date()
          },
          create: {
            startup_id: id,
            total_budget: defaultBudget,
            used_budget: 0,
            remaining_budget: defaultBudget
          }
        });

        // Create default budget categories
        const defaultCategories = [
          { name: 'Cloud Services', allocated: 15000, color: '#3B82F6' },
          { name: 'Marketing', allocated: 12000, color: '#10B981' },
          { name: 'IT Tools', allocated: 8000, color: '#8B5CF6' },
          { name: 'Events', allocated: 10000, color: '#F59E0B' },
          { name: 'Freelances', allocated: 20000, color: '#EF4444' },
          { name: 'Training', allocated: 10000, color: '#06B6D4' }
        ];

        for (const category of defaultCategories) {
          await fastify.prisma.budgetCategory.upsert({
            where: {
              startup_id_name: {
                startup_id: id,
                name: category.name
              }
            },
            update: {
              budget_allocated: category.allocated,
              budget_used: 0,
              color: category.color,
              updated_at: new Date()
            },
            create: {
              startup_id: id,
              name: category.name,
              budget_allocated: category.allocated,
              budget_used: 0,
              color: category.color
            }
          });
        }

        return reply.send({
          success: true,
          message: 'Startup approved successfully'
        });

      } else if (action === 'reject') {
        // Update startup status to rejected
        await fastify.prisma.startup.update({
          where: { id },
          data: {
            status: 'REJECTED',
            rejection_reason: reason || 'Application rejected',
            updated_at: new Date()
          }
        });

        // Update user status to rejected
        await fastify.prisma.user.update({
          where: { id: startup.user_id },
          data: {
            status: 'REJECTED',
            updated_at: new Date()
          }
        });

        return reply.send({
          success: true,
          message: 'Startup rejected successfully'
        });
      }

    } catch (error) {
      fastify.log.error('Startup action error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get individual startup details
  fastify.get('/startups/:id', {
    schema: {
      tags: ['Startups'],
      summary: 'Get startup details',
      description: 'Get detailed information about a specific startup',
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
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                company_name: { type: 'string' },
                description: { type: 'string' },
                industry: { type: 'string' },
                founded_year: { type: 'number' },
                team_size: { type: 'string' },
                website: { type: 'string' },
                status: { type: 'string' },
                user: { type: 'object' },
                budget: { type: 'object' },
                categories: { type: 'array' },
                requests: { type: 'array' }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const startup = await fastify.prisma.startup.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              created_at: true
            }
          },
          budget: true,
          budget_categories: true,
          budget_requests: {
            orderBy: { created_at: 'desc' },
            take: 10
          }
        }
      });

      if (!startup) {
        return reply.code(404).send({
          success: false,
          message: 'Startup not found'
        });
      }

      const transformedStartup = {
        id: startup.id,
        company_name: startup.company_name,
        description: startup.description || '',
        industry: startup.industry || '',
        founded_year: startup.founded_year || new Date().getFullYear(),
        team_size: startup.team_size || '1-5',
        website: startup.website || '',
        status: startup.status.toLowerCase(),
        created_at: startup.created_at.toISOString(),
        updated_at: startup.updated_at.toISOString(),
        user: {
          id: startup.user.id,
          name: startup.user.name || 'Unknown',
          email: startup.user.email,
          status: startup.user.status.toLowerCase(),
          created_at: startup.user.created_at.toISOString()
        },
        budget: startup.budget ? {
          total_budget: Number(startup.budget.total_budget),
          used_budget: Number(startup.budget.used_budget),
          remaining_budget: Number(startup.budget.remaining_budget)
        } : null,
        categories: startup.budget_categories.map(cat => ({
          name: cat.name,
          allocated: Number(cat.budget_allocated),
          used: Number(cat.budget_used),
          color: cat.color
        })),
        requests: startup.budget_requests.map(req => ({
          id: req.id,
          category: req.category,
          description: req.description,
          amount: Number(req.amount),
          status: req.status.toLowerCase(),
          created_at: req.created_at.toISOString()
        }))
      };

      return reply.send({
        success: true,
        data: transformedStartup
      });

    } catch (error) {
      fastify.log.error('Get startup details error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}; 