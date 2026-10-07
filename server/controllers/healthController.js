import mongoose from 'mongoose';

export function getHealthStatus(_request, response) {
  const databaseState = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  response.status(200).json({
    status: 'ok',
    service: 'aegis-forge-api',
    version: process.env.API_VERSION || 'v1',
    database: databaseState,
    timestamp: new Date().toISOString(),
  });
}
