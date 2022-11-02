import { Prisma } from '@prisma/client'
import { createPrismaRedisCache } from 'prisma-redis-middleware'
import defaultLogger from '../logger/logger.service'
import redisClient from '../redis/redis'

const inMemoryStorage = { type: 'memory', options: { size: 2048 }, log: console }

const cacheMiddleware: Prisma.Middleware = createPrismaRedisCache({
  models: [
    { model: 'Post', cacheTime: 180, cacheKey: 'post' },
  ],
  storage: { type: 'redis', options: { client: redisClient, invalidation: { referencesTTL: 300 }, log: defaultLogger } },
  cacheTime: 300,
  excludeModels: ['User'], // e.g- ['Product', 'Cart']
  excludeMethods: ['count', 'groupBy'],
  onHit: (key) => {
    defaultLogger.info('hit', key)
  },
  onMiss: (key) => {
    defaultLogger.warn('miss', key)
  },
  onError: (key) => {
    defaultLogger.error('error', key)
  },
})

export default cacheMiddleware
