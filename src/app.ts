import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

import config from 'config'
import helmet from 'helmet'
import cors from 'cors'

import logger from './utils/logger'
import routes from './routes'
import parseJwt from './middleware/parse-jwt'
import swaggerDocs from './utils/swagger'
import prisma from './utils/prisma'
import httpLogger from './middleware/http-logger'
import rateLimiter from './middleware/rate-limiter'
import { webhooksHandler } from './controller/webhooks.controller'

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

  logger.info(`🚀 App is running at http://localhost:${port}`)

  routes(app)

  swaggerDocs(app, port)
})
