import logger from 'pino'
import dayjs from 'dayjs'
import PinoHttp from 'pino-http'

const defaultLogger = logger({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
})

export const entityLogger = function (entity: string) {
  return {
    info: (message: string) => defaultLogger.info(`${entity.toUpperCase()}: ${message}`),
    error: (message: string) => defaultLogger.error(`${entity.toUpperCase()}: ${message}`),
    warn: (message: string) => defaultLogger.warn(`${entity.toUpperCase()}: ${message}`),
  }
}

export default defaultLogger
