const { createLogger, format, transports } = require('winston');

const { combine, timestamp, errors, json, colorize, printf } = format;

const SERVICE_NAME = 'auth-service';

const devFormat = printf(({ level, message, timestamp: ts, requestId, ...meta }) => {
  const rid = requestId ? ` [${requestId}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} ${level}${rid}: ${message}${metaStr}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: SERVICE_NAME },
  format: combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), errors({ stack: true })),
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: json(),
    }),
    new transports.File({
      filename: 'logs/combined.log',
      format: json(),
    }),
  ],
});

// Development: add colourised console output
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), devFormat),
    })
  );
}

module.exports = logger;
