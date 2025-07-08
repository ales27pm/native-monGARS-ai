// ====================================================================================
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const CURRENT_LOG_LEVEL = 'debug';

const log = (level: keyof typeof LOG_LEVELS, source: string, message: string, data?: any) => {
  if (LOG_LEVELS[level] > LOG_LEVELS[CURRENT_LOG_LEVEL]) {
    return;
  }

  const now = new Date().toISOString();
  const colorMap = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
    debug: '\x1b[35m',
  };

  console.log(
    `${colorMap[level]}[${now}] [${level.toUpperCase()}] [${source}] - ${message}`,
    data ? JSON.stringify(data, null, 2) : ''
  );
};

export const logger = {
  error: (source: string, message: string, error?: any) => log('error', source, message, error),
  warn: (source: string, message: string, data?: any) => log('warn', source, message, data),
  info: (source: string, message: string, data?: any) => log('info', source, message, data),
  debug: (source: string, message: string, data?: any) => log('debug', source, message, data),
};


// ====================================================================================
// ===== End of File: src/utils/logger.ts =====

