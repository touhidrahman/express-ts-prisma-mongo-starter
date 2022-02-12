import logger from 'pino'
import dayjs from 'dayjs'
import PinoHttp from 'pino-http'

const defaultLogger = logger({
  level: 'info',
  transport: {
    target: 'pino-pretty',
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format()}"`,
})

export default defaultLogger
