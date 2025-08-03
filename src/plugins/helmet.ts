import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

/**
 * Helmet plugin for security headers
 */
module.exports = fp(async function (fastify: FastifyInstance) {
  await fastify.register(require('@fastify/helmet'), {
    global: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    originAgentCluster: true,
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    ieNoOpen: true,
    xssFilter: true,
  });
}); 