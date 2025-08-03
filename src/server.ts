import fastify from 'fastify';
import { config } from 'dotenv';
import chalk from 'chalk';
import { PrismaClient } from '@prisma/client';

// Load environment variables
config();

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Fastify instance with logging
const app = fastify({
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

// Add Prisma to Fastify instance
app.decorate('prisma', prisma);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(chalk.yellow(`\n🔄 Received ${signal}, shutting down gracefully...`));
  
  try {
    await prisma.$disconnect();
    console.log(chalk.green('✅ Database connection closed'));
    
    await app.close();
    console.log(chalk.green('✅ Server closed'));
    
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('❌ Error during shutdown:'), error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log(chalk.green('✅ Database connected successfully'));

    // Register plugins
    await app.register(require('./plugins/swagger'));
    await app.register(require('./plugins/cors'));
    await app.register(require('./plugins/helmet'));
    await app.register(require('./plugins/rate-limit'));

    // Register routes with /api/v1 prefix
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

    // Start server
    const port = Number(process.env.PORT) || 3294;
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    
    console.log(chalk.cyan.bold('\n🚀 BMAQ Backend Server Started!'));
    console.log(chalk.cyan(`📡 Server running on: http://${host}:${port}`));
    console.log(chalk.cyan(`📚 Swagger docs: http://${host}:${port}/docs`));
    console.log(chalk.cyan(`🔍 Health check: http://${host}:${port}/api/v1/health`));
    console.log(chalk.cyan(`🔐 Auth endpoint: http://${host}:${port}/api/v1/auth/login`));
    console.log(chalk.gray('Press Ctrl+C to stop the server\n'));
    
  } catch (error) {
    console.error(chalk.red('❌ Error starting server:'), error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Uncaught Exception:'), error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Unhandled Rejection at:'), promise, 'reason:', reason);
  process.exit(1);
});

start();

// Export for testing
export default app;

// Augment Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
} 