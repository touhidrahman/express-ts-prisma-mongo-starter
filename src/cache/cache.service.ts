import { memoryCache } from './memory-cache'
import redisClient from './redis'

export async function doCache(key: string, value: any, ttl: number = 900) {
  const data = JSON.stringify(value)
  if (redisClient.isOpen) {
    return redisClient.setEx(key, ttl, data)
  } else {
    // use in memory cache
    memoryCache.put(key, data, ttl)
  }
}

export async function fromCache(key: string): Promise<unknown | null> {
  if (redisClient.isOpen) {
    const cached = await redisClient.get(key)
    if (cached) return JSON.parse(cached)
  } else {
    // use in memory cache
    const cached = memoryCache.get(key)
    if (cached) return JSON.parse(cached as any)
  }
  return null
}
