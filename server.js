const app = require('./app');
const appConfig = require('./app/config/app.config');
const logger = require('./app/config/logger');

const server = app.listen(appConfig.port, () => {
  logger.info(`=======================================================`);
  logger.info(`  ${appConfig.appName} is running`);
  logger.info(`  Environment: ${appConfig.env}`);
  logger.info(`  Access URL:  http://localhost:${appConfig.port}`);
  logger.info(`=======================================================`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated.');
  });
});
