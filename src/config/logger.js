const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('./config');

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) Object.assign(info, { message: info.stack });
  return info;
});

const transports = [];

// — Console transport (as you already have) —
transports.push(
  new winston.transports.Console({
    level: config.env === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
      enumerateErrorFormat(),
      config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
      winston.format.splat(),
      winston.format.printf(({ level, message }) => `${level}: ${message}`)
    ),
    stderrLevels: ['error'],
  })
);

// — Daily rotate file transport —
transports.push(
  new DailyRotateFile({
    level: 'info', // log level for files
    dirname: 'logs', // folder to save log files
    filename: 'application-%DATE%.log',
    datePattern: 'YYYY-MM-DD', // daily rotation
    zippedArchive: true, // gzip old logs
    maxSize: '20m', // rotate when file exceeds 20 megabytes
    maxFiles: '14d', // keep logs for 14 days
    format: winston.format.combine(
      enumerateErrorFormat(),
      winston.format.splat(),
      // eslint-disable-next-line no-unused-vars
      winston.format.printf(({ timestamp, level, message }) => `${new Date().toISOString()} ${level}: ${message}`)
    ),
  })
);

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  transports,
  exitOnError: false,
});

module.exports = logger;
