import { FastifyInstance } from 'fastify';

/**
 * Users routes
 */
module.exports = async function (fastify: FastifyInstance) {
  // TODO: Implement users routes
  fastify.get('/users', async (request, reply) => {
    return { message: 'Users routes - Coming soon' };
  });
}; 