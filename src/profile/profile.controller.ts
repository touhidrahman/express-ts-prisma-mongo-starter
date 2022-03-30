import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { CommonQueryParams } from '../core/interfaces/query-params'
import logger from '../core/service/logger.service'
import prisma from '../core/db/prisma'
import { buildResponseMessages } from '../core/utils/response-messages.util'
import redisClient from '../core/db/redis'

const entity = 'profile'
const logDomain = entity.toUpperCase()
const service = prisma[entity]
const resMessages = buildResponseMessages(entity)
const cacheTime = 900
type CreateInput = Prisma.ProfileCreateManyInput
type UpdateInput = Prisma.ProfileUncheckedUpdateInput

export async function getMany(req: Request<{}, {}, {}, CommonQueryParams>, res: Response) {
  try {
    const { search = '', take = 24, skip = 0, orderBy = 'asc', published = true } = req.query
    const cacheKey = `${entity}:${JSON.stringify(req.query)}`

    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey)
      if (cached) return res.json(JSON.parse(cached))
    }

    const result = await service.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { city: { contains: search, mode: 'insensitive' } },
                { country: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
        published,
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    })

    redisClient.isOpen && await redisClient.setEx(cacheKey, cacheTime, JSON.stringify(result))

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: resMessages.serverError })
  }
}

export async function getOne(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params
    const cacheKey = `${entity}:${id}`

    if (redisClient.isOpen) {
      const cached = await redisClient.get(cacheKey)
      if (cached) return res.json(JSON.parse(cached))
    }

    const result = await service.findUnique({
      where: { id },
    })

    redisClient.isOpen && await redisClient.setEx(cacheKey, cacheTime, JSON.stringify(result))

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${resMessages.notFound}. ${error.message}`)
    res.status(404).send({ message: resMessages.notFound })
  }
}

export async function create(req: Request<{}, {}, CreateInput>, res: Response) {
  try {
    const data = req.body
    const result = await service.create({
      data: {
        ...data,
      },
    })

    logger.info(`${logDomain}: ${resMessages.created}.`)
    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${resMessages.createFailed}. ${error.message}`)
    res.status(500).send({ message: resMessages.createFailed })
  }
}

export async function update(req: Request<{ id: string }, {}, UpdateInput>, res: Response) {
  try {
    const { id } = req.params
    const data = req.body

    const result = await service.update({
      where: { id },
      data: {
        ...data,
      },
    })

    logger.info(`${logDomain}: ${resMessages.updated}.`)
    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${resMessages.updateFailed}. ${error.message}`)
    res.status(500).send({ message: resMessages.updateFailed })
  }
}

export async function deleteOne(req: Request<{ id: string }, {}>, res: Response) {
  try {
    const { id } = req.params

    const result = await service.delete({
      where: { id },
    })

    logger.info(`${logDomain}: ${resMessages.deleted}.`)
    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${resMessages.deleteFailed} ${error.message}`)
    res.status(500).send({ message: resMessages.deleteFailed })
  }
}
