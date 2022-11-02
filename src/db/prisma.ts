import { PrismaClient } from '@prisma/client'
import cacheMiddleware from './cache.middleware'

const prisma = new PrismaClient()
prisma.$use(cacheMiddleware)

export default prisma
