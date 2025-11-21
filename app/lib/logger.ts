// app/lib/logger.ts
/**
 * @fileoverview Centralized logger utility.
 * Provides consistent, structured, and environment-aware logging with type-safe
 * event validation using Zod.
 */

import { eventSchema, EventName, EventPayload } from './analytics-events';
import { fromZodError } from 'zod-validation-error';

const isDev = process.env.NODE_ENV !== 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'log';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (isDev) {
    const timestamp = new Date().toISOString();
    
    const logArgs: Array<string | Record<string, unknown>> = [`[${level.toUpperCase()}] ${timestamp}: ${message}`];
    if (meta && Object.keys(meta).length > 0) {
        logArgs.push(meta);
    }
    
    switch (level) {
      case 'info':
        console.info(...logArgs);
        break;
      case 'warn':
        console.warn(...logArgs);
        break;
      case 'error':
        console.error(...logArgs);
        break;
      default:
        console.log(...logArgs);
        break;
    }
  } else {
    console.log(JSON.stringify({
      level,
      message,
      ...(meta || {}),
    }));
  }
}

function event<T extends EventName>(eventName: T, payload: EventPayload<T>) {
  const schema = eventSchema[eventName];
  const validation = schema.safeParse(payload);

  if (!validation.success) {
    const validationError = fromZodError(validation.error);
    log('error', `[EVENT VALIDATION FAILED] for event "${eventName}":`, {
        error: validationError.message,
        details: validationError.details,
    });
    if (!isDev) {
        log('error', '[INVALID_EVENT]', { event: eventName, payload, error: validationError.details });
    }
    return;
  }
  
  log('log', `[EVENT] ${eventName}`, payload);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  event,
};
