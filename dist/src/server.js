"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = require("dotenv");
const chalk_1 = __importDefault(require("chalk"));
const client_1 = require("@prisma/client");
(0, dotenv_1.config)();
const prisma = new client_1.PrismaClient();
const app = (0, fastify_1.default)({
    logger: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                colorize: true,
            },
        },
    },
});
app.decorate('prisma', prisma);
const gracefulShutdown = async (signal) => {
    console.log(chalk_1.default.yellow(`\n🔄 Received ${signal}, shutting down gracefully...`));
    try {
        await prisma.$disconnect();
        console.log(chalk_1.default.green('✅ Database connection closed'));
        await app.close();
        console.log(chalk_1.default.green('✅ Server closed'));
        process.exit(0);
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error during shutdown:'), error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
const start = async () => {
    try {
        await prisma.$connect();
        console.log(chalk_1.default.green('✅ Database connected successfully'));
        await app.register(require('./plugins/swagger'));
        await app.register(require('./plugins/cors'));
        await app.register(require('./plugins/helmet'));
        await app.register(require('./plugins/rate-limit'));
        await app.register(require('./routes/health'), { prefix: '/api/v1' });
        await app.register(require('./routes/auth'), { prefix: '/api/v1' });
        await app.register(require('./routes/dashboard'), { prefix: '/api/v1' });
        await app.register(require('./routes/analytics'), { prefix: '/api/v1' });
        await app.register(require('./routes/settings'), { prefix: '/api/v1' });
        await app.register(require('./routes/users'), { prefix: '/api/v1' });
        await app.register(require('./routes/startups'), { prefix: '/api/v1' });
        await app.register(require('./routes/budget'), { prefix: '/api/v1' });
        await app.register(require('./routes/events'), { prefix: '/api/v1' });
        await app.register(require('./routes/resources'), { prefix: '/api/v1' });
        await app.register(require('./routes/requests'), { prefix: '/api/v1' });
        await app.register(require('./routes/suivi'), { prefix: '/api/v1' });
        const port = Number(process.env.PORT) || 3294;
        const host = process.env.HOST || '0.0.0.0';
        await app.listen({ port, host });
        console.log(chalk_1.default.cyan.bold('\n🚀 BMAQ Backend Server Started!'));
        console.log(chalk_1.default.cyan(`📡 Server running on: http://${host}:${port}`));
        console.log(chalk_1.default.cyan(`📚 Swagger docs: http://${host}:${port}/docs`));
        console.log(chalk_1.default.cyan(`🔍 Health check: http://${host}:${port}/api/v1/health`));
        console.log(chalk_1.default.cyan(`🔐 Auth endpoint: http://${host}:${port}/api/v1/auth/login`));
        console.log(chalk_1.default.gray('Press Ctrl+C to stop the server\n'));
    }
    catch (error) {
        console.error(chalk_1.default.red('❌ Error starting server:'), error);
        process.exit(1);
    }
};
process.on('uncaughtException', (error) => {
    console.error(chalk_1.default.red('❌ Uncaught Exception:'), error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk_1.default.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
    process.exit(1);
});
start();
exports.default = app;
//# sourceMappingURL=server.js.map