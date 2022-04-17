import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

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
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import socket from './core/socket/socket'
import { PORT } from './vars'

const app = express()

app.post('/webhooks', express.raw({ type: 'application/json' }), webhooksHandler)

app.use(express.json())
app.use(cors())
app.use(httpLogger)
app.use(helmet())
app.use(rateLimiter)
app.use(parseJwt)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
})

httpServer.listen(PORT, async () => {
  await prisma.$connect()
  await redisClient.connect()

  logger.info(`🚀 App is running at http://localhost:${PORT}`)

  routes(app)
  swaggerDocs(app, PORT)
  socket({ io })
})

const signals = ['SIGTERM', 'SIGINT']
signals.forEach((signal: string) => {
  process.on(signal, async () => {
    await prisma.$disconnect()
    await redisClient.disconnect()
    await httpServer.close()

    logger.info(`App gracefully shut down on ${signal}`)

    process.exit(0)
  })
})
