import { Prisma, User } from '@prisma/client'
import { Request, Response } from 'express'
import logger from '../../logger/logger.service'
import prisma from '../../db/prisma'
import { buildResponseMessages } from '../../utils/response-messages.util'
import { CommonQueryParams } from '@src/interfaces/query-params'
import { doCache, fromCache } from '@src/redis/redis.service'

const entity = 'user'
const logDomain = entity.toUpperCase()
const service = prisma[entity]
const resMessages = buildResponseMessages(entity)
type CreateInput = Prisma.UserCreateManyInput
type UpdateInput = Prisma.UserUncheckedUpdateInput

function getSafeUser(user: User): any {
  return {
    ...user,
    password: undefined,
  }
}

export async function getMany(req: Request<{}, {}, {}, CommonQueryParams>, res: Response) {
  try {
    const { search = '', take = 24, skip = 0, orderBy = 'asc' } = req.query
    const cacheKey = `${entity}:${JSON.stringify(req.query)}`

    const cached = await fromCache(cacheKey)
    if (cached) return res.json(cached)

    const result = await service.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    })

    const safeResult = result.map((x) => getSafeUser(x))

    await doCache(cacheKey, safeResult)

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: resMessages.serverError })
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const { id } = req.params
    const cacheKey = `${entity}:${id}`

    const cached = await fromCache(cacheKey)
    if (cached) return res.json(cached)

    const user = await service.findUnique({
      where: { id },
    })

    if (!user) {
      return res.status(400).send({ message: resMessages.notFound })
    }

    const safeResult = getSafeUser(user)
    await doCache(cacheKey, safeResult)

    return res.json(safeResult)
  } catch (e: any) {
    logger.error(`${logDomain}: ${resMessages.notFound}. ${e.message}`)
    return res.status(400).json({ message: e.message })
  }
}

export async function update(req: Request, res: Response) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...req.body },
    })
    if (!user) {
      return res.status(400).send({ message: resMessages.notFound })
    }

    return res.json(getSafeUser(user))
  } catch (e: any) {
    logger.error(`${logDomain}: ${resMessages.updateFailed} ${e.message}`)
    return res.status(400).json({ message: e.message })
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
