import redisClient from './redis'

export async function doCache(key: string, value: any, ttl: number = 900) {
  if (redisClient.isOpen) {
    const data = JSON.stringify(value)
    return redisClient.setEx(key, ttl, data)
  }
}

export async function fromCache(key: string): Promise<unknown | null> {
  if (redisClient.isOpen) {
    const cached = await redisClient.get(key)
    if (cached) return JSON.parse(cached)
  }
  return null
}
