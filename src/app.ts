import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

import config from 'config'
import helmet from 'helmet'
import cors from 'cors'

import logger from './core/service/logger.service'
import routes from './routes'
import parseJwt from './core/middleware/parse-jwt'
import swaggerDocs from './core/utils/swagger'
import prisma from './core/db/prisma'
import httpLogger from './core/middleware/http-logger'
import rateLimiter from './core/middleware/rate-limiter'
import { webhooksHandler } from './webhook/webhooks.controller'
import redisClient from './core/db/redis'

const port = config.get<number>('port')

const app = express()

app.post('/webhooks', express.raw({ type: 'application/json' }), webhooksHandler)

app.use(express.json())
app.use(cors())
app.use(httpLogger)
app.use(helmet())
app.use(rateLimiter)
app.use(parseJwt)

app.listen(port, async () => {
  await prisma.$connect()

  await redisClient.connect()

  logger.info(`🚀 App is running at http://localhost:${port}`)

  routes(app)

  swaggerDocs(app, port)
})
