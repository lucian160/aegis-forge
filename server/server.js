import cookieParser from 'cookie-parser';
import express from 'express';
import { config, validateProductionEnvironment } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import auditRoutes from './routes/auditRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import authRoutes from './routes/authRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import userRoutes from './routes/userRoutes.js';

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
  });

  app.use(`/api/${config.apiVersion}/health`, healthRoutes);
  app.use(`/api/${config.apiVersion}/auth`, authRoutes);
  app.use(`/api/${config.apiVersion}/contact`, contactRoutes);
  app.use(`/api/${config.apiVersion}/applications`, applicationRoutes);
  app.use(`/api/${config.apiVersion}/audit`, auditRoutes);
  app.use(`/api/${config.apiVersion}/users`, userRoutes);
  app.use(`/api/${config.apiVersion}/meetings`, meetingRoutes);
  app.use(`/api/${config.apiVersion}/domains`, domainRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function startServer(port = config.port) {
  return new Promise((resolve, reject) => {
    const app = createApp();
    const server = app.listen(port, async () => {
      try {
        validateProductionEnvironment();
        await connectDatabase();
        console.info(`AEGIS Forge API listening on http://localhost:${port}/api/${config.apiVersion}/health`);
        resolve(server);
      } catch (error) {
        server.close(() => reject(error));
      }
    });

    const shutdown = async (signal) => {
      console.info(`${signal} received. Closing server.`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  });
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  startServer().catch((error) => {
    console.error('Failed to start AEGIS Forge API:', error.message);
    process.exit(1);
  });
}
