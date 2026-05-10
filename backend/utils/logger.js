const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

function getLogLevel() {
  return process.env.LOG_LEVEL && LEVELS[process.env.LOG_LEVEL] !== undefined
    ? process.env.LOG_LEVEL
    : 'info';
}

function shouldLog(level) {
  return LEVELS[level] <= LEVELS[getLogLevel()];
}

function format(level, message, meta) {
  const timestamp = new Date().toISOString();
  const suffix = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()} ${message}${suffix}`;
}

const logger = {
  error(message, meta) {
    if (shouldLog('error')) {
      console.error(format('error', message, meta));
    }
  },
  warn(message, meta) {
    if (shouldLog('warn')) {
      console.warn(format('warn', message, meta));
    }
  },
  info(message, meta) {
    if (shouldLog('info')) {
      console.log(format('info', message, meta));
    }
  },
  debug(message, meta) {
    if (shouldLog('debug')) {
      console.log(format('debug', message, meta));
    }
  }
};

module.exports = logger;
