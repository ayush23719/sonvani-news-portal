type LogLevel = 'debug' | 'info' | 'warn' | 'error'

type LogPayload = Record<string, unknown>

const logPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

function getConfiguredLevel(): LogLevel {
  const level = process.env.LOG_LEVEL

  if (level === 'debug' || level === 'info' || level === 'warn' || level === 'error') {
    return level
  }

  return 'info'
}

function writeLog(level: LogLevel, message: string, payload: LogPayload = {}): void {
  if (logPriority[level] < logPriority[getConfiguredLevel()]) {
    return
  }

  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    service: 'sonvani-backend',
    ...payload,
  }

  const serialized = JSON.stringify(logEntry)

  if (level === 'error') {
    console.error(serialized)
    return
  }

  if (level === 'warn') {
    console.warn(serialized)
    return
  }

  console.log(serialized)
}

export const logger = {
  debug: (message: string, payload?: LogPayload) => writeLog('debug', message, payload),
  info: (message: string, payload?: LogPayload) => writeLog('info', message, payload),
  warn: (message: string, payload?: LogPayload) => writeLog('warn', message, payload),
  error: (message: string, payload?: LogPayload) => writeLog('error', message, payload),
}
