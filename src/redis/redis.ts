import Redis from 'ioredis'
import logger from '../logger/logger.service'
import { REDIS_URL } from '../vars'

const redisClient = new Redis(REDIS_URL)

redisClient.on('connect', () => {
  logger.info(`REDIS: connection established`)
})

redisClient.on('error', (error) => {
  logger.error(`REDIS:Connection error: ${error}`)
})

export default redisClient
