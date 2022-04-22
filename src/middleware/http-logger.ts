import PinoHttp from 'pino-http'
import defaultLogger from '../logger/logger.service'

const httpLogger = PinoHttp({
  logger: defaultLogger,
  customLogLevel: (res, err) => {
    if (process.env.NODE_ENV !== 'production') return 'silent'

    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent'
    }
    return 'info'
  },
})

export default httpLogger
