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

// Authentication middleware for regular users
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

// Types for request bodies
interface BudgetAllocationRequest {
  startupName: string;
  founderName: string;
  totalBudget: number;
  categories: {
    [key: string]: number;
  };
}

/**
 * Budget management routes
 */
module.exports = async function (fastify: FastifyInstance) {
  
  // Get all startup budgets overview
  fastify.get('/budget/overview', {
    schema: {
      tags: ['Budget'],
      summary: 'Get all startup budget overviews',
      description: 'Get comprehensive budget information for all startups',
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
                  id: { type: 'number' },
                  startupName: { type: 'string' },
                  founderName: { type: 'string' },
                  totalAllocated: { type: 'number' },
                  totalUsed: { type: 'number' },
                  categories: { type: 'object' },
                  status: { type: 'string' },
                  lastUpdate: { type: 'string' }
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
      // Get all startups with their budgets and categories
      const startups = await fastify.prisma.startup.findMany({
        where: {
          status: 'APPROVED'
        },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          budget: true,
          budget_categories: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      // Transform data to match frontend expectations
      const budgetOverview = startups.map((startup, index) => {
        // Group categories by name
        const categories: any = {};
        startup.budget_categories.forEach(category => {
          const key = category.name.toLowerCase().replace(' ', '');
          categories[key] = {
            allocated: Number(category.budget_allocated),
            used: Number(category.budget_used)
          };
        });

        // Ensure all expected categories exist with default values
        const defaultCategories = ['cloud', 'marketing', 'it', 'events', 'freelances', 'training'];
        defaultCategories.forEach(cat => {
          if (!categories[cat]) {
            categories[cat] = { allocated: 0, used: 0 };
          }
        });

        return {
          id: index + 1, // Frontend expects numeric ID
          startupName: startup.company_name,
          founderName: startup.user.name || 'Unknown',
          totalAllocated: startup.budget ? Number(startup.budget.total_budget) : 0,
          totalUsed: startup.budget ? Number(startup.budget.used_budget) : 0,
          categories,
          status: 'active', // All approved startups are considered active
          lastUpdate: startup.updated_at.toISOString().split('T')[0] // Format as YYYY-MM-DD
        };
      });

      return reply.send({
        success: true,
        data: budgetOverview
      });

    } catch (error) {
      fastify.log.error('Budget overview error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get budget statistics
  fastify.get('/budget/stats', {
    schema: {
      tags: ['Budget'],
      summary: 'Get budget statistics',
      description: 'Get aggregated budget statistics for the dashboard',
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
                totalAllocated: { type: 'number' },
                totalUsed: { type: 'number' },
                totalRemaining: { type: 'number' }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get count of approved startups
      const totalStartups = await fastify.prisma.startup.count({
        where: { status: 'APPROVED' }
      });

      // Get budget aggregations
      const budgetStats = await fastify.prisma.startupBudget.aggregate({
        _sum: {
          total_budget: true,
          used_budget: true,
          remaining_budget: true
        }
      });

      const totalAllocated = Number(budgetStats._sum.total_budget || 0);
      const totalUsed = Number(budgetStats._sum.used_budget || 0);
      const totalRemaining = Number(budgetStats._sum.remaining_budget || 0);

      return reply.send({
        success: true,
        data: {
          totalStartups,
          totalAllocated,
          totalUsed,
          totalRemaining
        }
      });

    } catch (error) {
      fastify.log.error('Budget stats error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Create new budget allocation
  fastify.post('/budget/allocate', {
    schema: {
      tags: ['Budget'],
      summary: 'Create new budget allocation',
      description: 'Allocate budget to a startup with category breakdown',
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['startupName', 'founderName', 'totalBudget', 'categories'],
        properties: {
          startupName: { type: 'string' },
          founderName: { type: 'string' },
          totalBudget: { type: 'number' },
          categories: {
            type: 'object',
            properties: {
              cloud: { type: 'number' },
              marketing: { type: 'number' },
              it: { type: 'number' },
              events: { type: 'number' },
              freelances: { type: 'number' },
              training: { type: 'number' }
            }
          }
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
                budgetId: { type: 'string' }
              }
            }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    const body = request.body as BudgetAllocationRequest;
    try {
      const { startupName, founderName, totalBudget, categories } = body;
      
      // Validate that category totals don't exceed total budget
      const categoryTotal = Object.values(categories).reduce((sum, amount) => sum + amount, 0);
      if (categoryTotal > totalBudget) {
        return reply.code(400).send({
          success: false,
          message: 'Category allocations cannot exceed total budget'
        });
      }

      // Find the startup by name (or create if it doesn't exist)
      let startup = await fastify.prisma.startup.findFirst({
        where: {
          company_name: startupName
        },
        include: { user: true }
      });

      if (!startup) {
        return reply.code(404).send({
          success: false,
          message: 'Startup not found. Please create the startup first.'
        });
      }

      // Create or update budget - ADD to existing budget instead of replacing
      const existingBudget = await fastify.prisma.startupBudget.findUnique({
        where: { startup_id: startup.id }
      });

      const currentTotal = Number(existingBudget?.total_budget || 0);
      const newTotalBudget = currentTotal + totalBudget;
      const newRemainingBudget = Number(existingBudget?.remaining_budget || 0) + totalBudget;

      const budget = await fastify.prisma.startupBudget.upsert({
        where: { startup_id: startup.id },
        update: {
          total_budget: newTotalBudget,
          remaining_budget: newRemainingBudget,
          updated_at: new Date()
        },
        create: {
          startup_id: startup.id,
          total_budget: totalBudget,
          used_budget: 0,
          remaining_budget: totalBudget
        }
      });

      // Create/update budget categories - ADD to existing amounts instead of replacing
      const categoryNames = {
        cloud: 'Cloud Services',
        marketing: 'Marketing',
        it: 'IT Tools',
        events: 'Events',
        freelances: 'Freelances',
        training: 'Training'
      };

      for (const [key, amount] of Object.entries(categories)) {
        if (amount > 0) {
          // Get existing category budget
          const existingCategory = await fastify.prisma.budgetCategory.findUnique({
            where: {
              startup_id_name: {
                startup_id: startup.id,
                name: categoryNames[key as keyof typeof categoryNames]
              }
            }
          });

          const currentCategoryBudget = Number(existingCategory?.budget_allocated || 0);
          const newCategoryBudget = currentCategoryBudget + amount;

          await fastify.prisma.budgetCategory.upsert({
            where: {
              startup_id_name: {
                startup_id: startup.id,
                name: categoryNames[key as keyof typeof categoryNames]
              }
            },
            update: {
              budget_allocated: newCategoryBudget,
              updated_at: new Date()
            },
            create: {
              startup_id: startup.id,
              name: categoryNames[key as keyof typeof categoryNames],
              budget_allocated: amount,
              budget_used: 0,
              color: getCategoryColor(key)
            }
          });
        }
      }

      return reply.send({
        success: true,
        message: 'Budget allocated successfully',
        data: {
          budgetId: budget.id
        }
      });

    } catch (error) {
      fastify.log.error('Budget allocation error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get budget overview for startup users
  fastify.get('/budget/user/overview', {
    schema: {
      tags: ['Budget'],
      summary: 'Get budget overview for startup user',
      description: 'Get budget overview for the authenticated startup user',
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

      // Get user's startup
      const startup = await fastify.prisma.startup.findFirst({
        where: { user_id: user.id }
      });

      if (!startup) {
        return reply.send({
          success: true,
          data: {
            totalBudget: 0,
            usedBudget: 0,
            remainingBudget: 0,
            categories: []
          }
        });
      }

      // Get budget for the startup
      const budget = await fastify.prisma.startupBudget.findFirst({
        where: { startup_id: startup.id }
      });

      // Get budget categories
      const categories = await fastify.prisma.budgetCategory.findMany({
        where: { startup_id: startup.id }
      });

      // Transform categories data
      const transformedCategories = categories.map((category: any) => ({
        id: category.id,
        name: category.name,
        allocated: Number(category.budget_allocated),
        used: Number(category.budget_used),
        remaining: Number(category.budget_allocated) - Number(category.budget_used),
        percentage: Number(category.budget_allocated) > 0 
          ? Math.round((Number(category.budget_used) / Number(category.budget_allocated)) * 100) 
          : 0,
        color: category.color || getCategoryColor(category.name)
      }));

      return reply.send({
        success: true,
        data: {
          totalBudget: Number(budget?.total_budget || 0),
          usedBudget: Number(budget?.used_budget || 0),
          remainingBudget: Number(budget?.remaining_budget || 0),
          categories: transformedCategories
        }
      });

    } catch (error) {
      fastify.log.error('User budget overview error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get budget statistics for startup users
  fastify.get('/budget/user/stats', {
    schema: {
      tags: ['Budget'],
      summary: 'Get budget statistics for startup user',
      description: 'Get aggregated budget statistics for the authenticated startup user',
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

      // Get user's startup
      const startup = await fastify.prisma.startup.findFirst({
        where: { user_id: user.id }
      });

      if (!startup) {
        return reply.send({
          success: true,
          data: {
            totalAllocated: 0,
            totalUsed: 0,
            totalRemaining: 0,
            budgetUtilization: 0
          }
        });
      }

      // Get budget for the startup
      const budget = await fastify.prisma.startupBudget.findFirst({
        where: { startup_id: startup.id }
      });

      return reply.send({
        success: true,
        data: {
          totalAllocated: Number(budget?.total_budget || 0),
          totalUsed: Number(budget?.used_budget || 0),
          totalRemaining: Number(budget?.remaining_budget || 0),
          budgetUtilization: Number(budget?.total_budget || 0) > 0 
            ? Math.round((Number(budget?.used_budget || 0) / Number(budget?.total_budget || 0)) * 100) 
            : 0
        }
      });

    } catch (error) {
      fastify.log.error('User budget stats error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
};

// Helper function to get category colors
function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    'Cloud Services': '#3B82F6',
    'Marketing': '#10B981',
    'IT Tools': '#8B5CF6',
    'Events': '#F59E0B',
    'Freelances': '#EF4444',
    'Training': '#06B6D4',
    'Other': '#6B7280'
  };
  return colors[category] || '#6B7280';
}