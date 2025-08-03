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

/**
 * Suivi (Follow-up) routes for admin dashboard
 */
module.exports = async function (fastify: FastifyInstance) {
  
  // Get all suivi forms
  fastify.get('/suivi/forms', {
    schema: {
      tags: ['Suivi'],
      summary: 'Get all suivi forms',
      description: 'Get all follow-up forms with their statistics',
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
            data: { type: 'array' }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get all suivi forms
      const suiviForms = await fastify.prisma.suiviForm.findMany({
        include: {
          _count: {
            select: {
              responses: true,
              questions: true
            }
          },
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

      // Get total approved startups for response rate calculation
      const totalStartups = await fastify.prisma.user.count({
        where: {
          role: 'STARTUP',
          status: 'APPROVED'
        }
      });

      const formsWithStats = await Promise.all(
        suiviForms.map(async (form) => {
          // Get unique startup responses for this form
          const uniqueResponses = await fastify.prisma.suiviResponse.groupBy({
            by: ['user_id'],
            where: {
              form_id: form.id
            },
            _count: {
              id: true
            }
          });

          const responseCount = uniqueResponses.length;
          const responseRate = totalStartups > 0 ? Math.round((responseCount / totalStartups) * 100) : 0;

          // Get the last time this form was sent/scheduled
          const lastSent = form.created_at; // Using created_at as fallback
          
          // Calculate next scheduled date based on frequency
          const nextScheduled = new Date(lastSent);
          switch (form.frequency) {
            case 'WEEKLY':
              nextScheduled.setDate(nextScheduled.getDate() + 7);
              break;
            case 'MONTHLY':
              nextScheduled.setMonth(nextScheduled.getMonth() + 1);
              break;
            case 'QUARTERLY':
              nextScheduled.setMonth(nextScheduled.getMonth() + 3);
              break;
            case 'INSTANT':
              nextScheduled.setDate(nextScheduled.getDate() + 1);
              break;
          }

          return {
            id: form.id,
            title: form.title,
            description: form.description,
            status: form.status.toLowerCase(),
            frequency: form.frequency.toLowerCase(),
            totalQuestions: form._count.questions,
            responses: responseCount,
            totalStartups,
            responseRate,
            nextScheduled: nextScheduled.toISOString().split('T')[0],
            createdAt: form.created_at.toISOString().split('T')[0],
            lastSent: lastSent.toISOString().split('T')[0],
            categories: [] // Empty array for now as we don't have categories in the schema
          };
        })
      );

      return reply.send({
        success: true,
        data: formsWithStats
      });

    } catch (error) {
      fastify.log.error('Suivi forms error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Get suivi analytics
  fastify.get('/suivi/analytics', {
    schema: {
      tags: ['Suivi'],
      summary: 'Get suivi analytics',
      description: 'Get analytics data for suivi forms and responses',
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
          period: { type: 'string', enum: ['7d', '30d', '90d', '1y'], default: '30d' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { period = '30d' } = request.query as { period?: string };
      
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get total forms
      const totalForms = await fastify.prisma.suiviForm.count();

      // Get active forms
      const activeForms = await fastify.prisma.suiviForm.count({
        where: {
          status: 'ACTIVE'
        }
      });

      // Get total responses in period
      const totalResponses = await fastify.prisma.suiviResponse.count({
        where: {
          submitted_at: {
            gte: startDate
          }
        }
      });

      // Get response rate
      const totalStartups = await fastify.prisma.user.count({
        where: {
          role: 'STARTUP',
          status: 'APPROVED'
        }
      });

      const responseRate = totalStartups > 0 && activeForms > 0 ? 
        Math.round((totalResponses / (totalStartups * activeForms)) * 100) : 0;

      // Get responses by form
      const responsesByForm = await fastify.prisma.suiviResponse.groupBy({
        by: ['form_id'],
        where: {
          submitted_at: {
            gte: startDate
          }
        },
        _count: {
          id: true
        }
      });

      // Get form details for response analysis
      const formResponseData = await Promise.all(
        responsesByForm.map(async (response) => {
          const form = await fastify.prisma.suiviForm.findUnique({
            where: { id: response.form_id }
          });
          
          return {
            formTitle: form?.title || 'Unknown Form',
            responses: response._count.id,
            formId: response.form_id
          };
        })
      );

      // Get completion trends (responses over time)
      const responseTrends = await fastify.prisma.suiviResponse.groupBy({
        by: ['submitted_at'],
        where: {
          submitted_at: {
            gte: startDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          submitted_at: 'asc'
        }
      });

      // Group by day/week/month depending on period
      const trendsData = responseTrends.reduce((acc: any, item) => {
        const date = new Date(item.submitted_at);
        let key: string;
        
        if (period === '7d') {
          key = date.toISOString().split('T')[0]; // Daily
        } else if (period === '30d') {
          key = date.toISOString().split('T')[0]; // Daily
        } else {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // Monthly
        }
        
        acc[key] = (acc[key] || 0) + item._count.id;
        return acc;
      }, {});

      // Get completion rates by startup
      const completionByStartup = await fastify.prisma.suiviResponse.groupBy({
        by: ['user_id'],
        where: {
          submitted_at: {
            gte: startDate
          }
        },
        _count: {
          id: true
        }
      });

      const avgCompletionRate = completionByStartup.length > 0 ?
        Math.round(completionByStartup.reduce((sum, item) => sum + item._count.id, 0) / completionByStartup.length) : 0;

      const analyticsData = {
        overview: {
          totalForms,
          activeForms,
          totalResponses,
          responseRate,
          avgCompletionRate,
          totalStartups
        },
        responsesByForm: formResponseData,
        trends: trendsData,
        completionStats: {
          highPerformers: completionByStartup.filter(item => item._count.id >= 3).length,
          regularUsers: completionByStartup.filter(item => item._count.id >= 1 && item._count.id < 3).length,
          inactiveUsers: totalStartups - completionByStartup.length
        }
      };

      return reply.send({
        success: true,
        data: analyticsData
      });

    } catch (error) {
      fastify.log.error('Suivi analytics error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Create a new suivi form
  fastify.post('/suivi/forms', {
    schema: {
      tags: ['Suivi'],
      summary: 'Create a new suivi form',
      description: 'Create a new follow-up form',
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['title', 'description', 'frequency', 'questions'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          frequency: { type: 'string', enum: ['weekly', 'monthly', 'quarterly', 'yearly'] },
          questions: { type: 'array' },
          categories: { type: 'array' }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { title, description, frequency, questions } = request.body as {
        title: string;
        description: string;
        frequency: string;
        questions: any[];
        categories?: string[];
      };

      // Map frequency to enum value
      const frequencyMap: { [key: string]: string } = {
        'weekly': 'WEEKLY',
        'monthly': 'MONTHLY',
        'quarterly': 'QUARTERLY',
        'yearly': 'QUARTERLY', // Map yearly to quarterly for now
        'instant': 'INSTANT'
      };

      const dbFrequency = frequencyMap[frequency.toLowerCase()] || 'MONTHLY';

      // Create the form first
      const newForm = await fastify.prisma.suiviForm.create({
        data: {
          title,
          description,
          frequency: dbFrequency as any,
          status: 'ACTIVE',
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      // Create questions if provided
      if (questions && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions[i];
          
          // Map question type to enum
          const typeMap: { [key: string]: string } = {
            'text': 'TEXT',
            'textarea': 'TEXTAREA',
            'select': 'SELECT',
            'multiselect': 'MULTISELECT',
            'number': 'NUMBER',
            'rating': 'RATING',
            'checkbox': 'CHECKBOX'
          };

          const dbType = typeMap[question.type?.toLowerCase()] || 'TEXT';

          await fastify.prisma.suiviQuestion.create({
            data: {
              form_id: newForm.id,
              type: dbType as any,
              title: question.title || 'Untitled Question',
              description: question.description || null,
              required: question.required || false,
              order_index: i + 1,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
        }
      }

      // Fetch the complete form with questions
      const completeForm = await fastify.prisma.suiviForm.findUnique({
        where: { id: newForm.id },
        include: {
          questions: {
            orderBy: {
              order_index: 'asc'
            }
          }
        }
      });

      return reply.code(201).send({
        success: true,
        data: completeForm
      });

    } catch (error) {
      fastify.log.error('Create suivi form error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Update suivi form status
  fastify.patch('/suivi/forms/:id/status', {
    schema: {
      tags: ['Suivi'],
      summary: 'Update suivi form status',
      description: 'Update the status of a suivi form (active/paused/archived)',
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
          status: { type: 'string', enum: ['active', 'paused', 'archived'] }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: string };

      // Map status to enum value
      const statusMap: { [key: string]: string } = {
        'active': 'ACTIVE',
        'paused': 'ACTIVE', // Map paused to active for now
        'archived': 'ARCHIVED'
      };

      const dbStatus = statusMap[status.toLowerCase()] || 'ACTIVE';

      const updatedForm = await fastify.prisma.suiviForm.update({
        where: { id },
        data: {
          status: dbStatus as any,
          updated_at: new Date()
        }
      });

      return reply.send({
        success: true,
        data: updatedForm
      });

    } catch (error) {
      fastify.log.error('Update suivi form status error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });

  // Delete suivi form
  fastify.delete('/suivi/forms/:id', {
    schema: {
      tags: ['Suivi'],
      summary: 'Delete a suivi form',
      description: 'Delete a follow-up form and all its responses',
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
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: authenticateAdmin
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // Delete all responses first
      await fastify.prisma.suiviResponse.deleteMany({
        where: { form_id: id }
      });

      // Delete all questions
      await fastify.prisma.suiviQuestion.deleteMany({
        where: { form_id: id }
      });

      // Delete the form
      await fastify.prisma.suiviForm.delete({
        where: { id }
      });

      return reply.send({
        success: true,
        message: 'Suivi form deleted successfully'
      });

    } catch (error) {
      fastify.log.error('Delete suivi form error:', error);
      return reply.code(500).send({
        success: false,
        message: 'Internal server error'
      });
    }
  });
}; 