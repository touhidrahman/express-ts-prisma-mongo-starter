import config from 'config'
import { createClient } from 'redis'
import logger from '../service/logger.service'

const redisClient = createClient({
  url: config.get<string>('redisUri'),
  password: config.get<string>('redisPassword'),
})

redisClient.on('connect', () => {
  logger.info(`Redis connection established`)
})

redisClient.on('error', (error) => {
  logger.error(`Redis error, service degraded: ${error}`)
})

export default redisClient
