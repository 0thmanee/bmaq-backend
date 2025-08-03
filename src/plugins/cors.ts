import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

/**
 * CORS plugin for handling cross-origin requests
 */
module.exports = fp(async function (fastify: FastifyInstance) {
  await fastify.register(require('@fastify/cors'), {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const hostname = new URL(origin || 'http://localhost').hostname;
      
      // Allow localhost for development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        callback(null, true);
        return;
      }
      
      // Allow your frontend domain in production
      if (process.env.NODE_ENV === 'production') {
        // Add your production frontend domain here
        const allowedOrigins = [
          'https://your-frontend-domain.com',
          'https://bmaq.your-domain.com',
        ];
        
        if (allowedOrigins.includes(origin || '')) {
          callback(null, true);
          return;
        }
      } else {
        // Allow all origins in development
        callback(null, true);
        return;
      }
      
      callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });
}); 