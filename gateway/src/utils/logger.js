const { createLogger, format, transports, addColors } = require('winston');

const { combine, timestamp, errors, json, colorize, printf } = format;

const SERVICE_NAME = 'api-gateway';

// Add custom 'http' level
const customLevels = {
  levels: { error: 0, warn: 1, info: 2, http: 3, debug: 4 },
  colors: { http: 'magenta' },
};
addColors(customLevels.colors);

const devFormat = printf(({ level, message, timestamp: ts, requestId, ...meta }) => {
  const rid = requestId ? ` [${requestId}]` : '';
  const metaStr =
    Object.keys(meta).length && Object.keys(meta).some((k) => k !== 'service')
      ? ` ${JSON.stringify(meta)}`
      : '';
  return `${ts} ${level}${rid}: ${message}${metaStr}`;
});

const logger = createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'http',
  defaultMeta: { service: SERVICE_NAME },
  format: combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), errors({ stack: true })),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error', format: json() }),
    new transports.File({ filename: 'logs/combined.log', format: json() }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), devFormat),
    })
  );
}

module.exports = logger;
