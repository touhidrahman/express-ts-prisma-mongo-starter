import express from 'express'
import dotenv from 'dotenv'

dotenv.config()

import config from 'config'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import logger from './utils/logger'
import routes from './routes'
import deserializeUser from './middleware/deserializeUser'
import swaggerDocs from './utils/swagger'
import prisma from './utils/prisma'

const port = config.get<number>('port')
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

const app = express()

app.use(express.json())
app.use(helmet())
app.use(limiter)
app.use(deserializeUser)

app.listen(port, async () => {
  await prisma.$connect()

  logger.info(`🚀 App is running at http://localhost:${port}`)

  routes(app)

  swaggerDocs(app, port)
})
