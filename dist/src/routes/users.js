"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
module.exports = async function (fastify) {
    fastify.get('/users', async (request, reply) => {
        return { message: 'Users routes - Coming soon' };
    });
};
//# sourceMappingURL=users.js.map