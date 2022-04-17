import { createClient } from 'redis'
import { REDIS_PASSWORD, REDIS_URL } from '../../vars'
import logger from '../service/logger.service'

const redisClient = createClient({
  url: REDIS_URL,
  password: REDIS_PASSWORD,
})

redisClient.on('connect', () => {
  logger.info(`Redis connection established`)
})

redisClient.on('error', (error) => {
  logger.error(`Redis error, service degraded: ${error}`)
})

export default redisClient
