import { createWriteStream, type WriteStream } from 'node:fs';
import { areProcessStdioWritesSuppressed } from './shutdown-state.ts';

const LOG_LEVELS = {
  none: -1,
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warn: 4,
  notice: 5,
  info: 6,
  debug: 7,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export interface LogContext {
  sentry?: boolean;
}

export function __shouldCaptureToSentryForTests(_context?: LogContext): boolean {
  return false;
}

export function __mapLogLevelToSentryForTests(level: string): string {
  return level;
}

let clientLogLevel: LogLevel = 'none';
let logFileStream: WriteStream | null = null;
let logFilePath: string | null = null;

function isTestEnv(): boolean {
  return (
    process.env.VITEST === 'true' ||
    process.env.NODE_ENV === 'test' ||
    process.env.XCODEBUILDMCP_SILENCE_LOGS === 'true'
  );
}

export function normalizeLogLevel(raw: string): LogLevel | null {
  const lower = raw.trim().toLowerCase();
  const mapped = lower === 'warning' ? 'warn' : lower;
  if (mapped in LOG_LEVELS) return mapped as LogLevel;
  return null;
}

export function coerceLogLevel(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  return value.trim().toLowerCase() === 'warning' ? 'warn' : value;
}

export function setLogLevel(level: LogLevel): void {
  clientLogLevel = level;
  log('debug', `Log level set to: ${level}`);
}

export function setLogFile(path: string | null): void {
  if (!path) {
    if (logFileStream) {
      try {
        logFileStream.end();
      } catch {}
    }
    logFileStream = null;
    logFilePath = null;
    return;
  }
  if (logFilePath === path && logFileStream) return;
  if (logFileStream) {
    try {
      logFileStream.end();
    } catch {}
  }
  try {
    const stream = createWriteStream(path, { flags: 'a' });
    stream.on('error', () => {
      if (stream !== logFileStream) return;
      logFileStream = null;
      logFilePath = null;
    });
    logFileStream = stream;
    logFilePath = path;
  } catch {
    logFileStream = null;
    logFilePath = null;
  }
}

export function getLogLevel(): LogLevel {
  return clientLogLevel;
}

function shouldLog(level: string): boolean {
  if (isTestEnv() && !logFileStream) return false;
  if (clientLogLevel === 'none') return false;
  const key = level.toLowerCase() as LogLevel;
  if (!(key in LOG_LEVELS)) return true;
  return LOG_LEVELS[key] <= LOG_LEVELS[clientLogLevel];
}

export function log(level: string, message: string, _context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (logFileStream && clientLogLevel !== 'none') {
    try {
      logFileStream.write(`${logMessage}\n`);
    } catch {}
  }
  if (!shouldLog(level)) return;
  if (areProcessStdioWritesSuppressed()) return;
  console.error(logMessage);
}
