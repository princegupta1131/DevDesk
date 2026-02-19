type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: LogLevel = (import.meta.env.DEV ? 'debug' : 'error');

const ORDER: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};

const shouldLog = (level: LogLevel): boolean => ORDER[level] >= ORDER[LOG_LEVEL] && import.meta.env.DEV;

const write = (level: LogLevel, ...args: unknown[]) => {
    if (!shouldLog(level)) return;
    const fn = console[level] as (...values: unknown[]) => void;
    fn(...args);
};

export const logger = {
    debug: (...args: unknown[]) => write('debug', ...args),
    info: (...args: unknown[]) => write('info', ...args),
    warn: (...args: unknown[]) => write('warn', ...args),
    error: (...args: unknown[]) => write('error', ...args),
};

