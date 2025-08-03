"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Users routes
 */
module.exports = async function (fastify) {
    // TODO: Implement users routes
    fastify.get('/users', async (request, reply) => {
        return { message: 'Users routes - Coming soon' };
    });
};
//# sourceMappingURL=users.js.map