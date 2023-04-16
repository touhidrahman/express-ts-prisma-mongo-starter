import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../../db/prisma'
import { CommonQueryParams } from '../../interfaces/query-params'
import { entityLogger } from '../../logger/logger.service'
import { doCache, fromCache } from '../../cache/cache.service'
import { buildResponseMessages } from '../../utils/response-messages.util'

const entity = 'post'
const log = entityLogger(entity)
const service = prismaClient[entity]
const resMessages = buildResponseMessages(entity)
type CreateInput = Prisma.PostCreateManyInput
type UpdateInput = Prisma.PostUncheckedUpdateInput

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
                { title: { contains: search, mode: 'insensitive' } },
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

    await doCache(cacheKey, result)

    res.send(result)
  } catch (error: any) {
    log.error(error.message)
    res.status(500).send({ message: resMessages.serverError })
  }
}

export async function getOne(req: Request, res: Response) {
  try {
    const { id } = req.params
    const cacheKey = `${entity}:${id}`

    const cached = await fromCache(cacheKey)
    if (cached) return res.json(cached)

    const result = await service.findUnique({
      where: { id },
    })

    if (!result) {
      return res.status(400).send({ message: resMessages.notFound })
    }

    await doCache(cacheKey, result)

    return res.json(result)
  } catch (e: any) {
    log.error(`${resMessages.notFound}. ${e.message}`)
    return res.status(400).json({ message: e.message })
  }
}

export async function create(req: Request<{}, {}, CreateInput>, res: Response) {
  try {
    const data = req.body
    const user = res.locals.user

    const result = await service.create({
      data: {
        ...data,
        authorId: user.id,
      },
    })

    log.info(resMessages.created)
    res.send(result)
  } catch (error: any) {
    log.error(`${resMessages.createFailed}. ${error.message}`)
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

    log.info(resMessages.updated)
    res.send(result)
  } catch (error: any) {
    log.error(`${resMessages.updateFailed}. ${error.message}`)
    res.status(500).send({ message: resMessages.updateFailed })
  }
}

export async function deleteOne(req: Request<{ id: string }, {}>, res: Response) {
  try {
    const { id } = req.params

    const result = await service.delete({
      where: { id },
    })

    log.info(resMessages.deleted)
    res.send(result)
  } catch (error: any) {
    log.error(`${resMessages.deleteFailed}. ${error.message}`)
    res.status(500).send({ message: resMessages.deleteFailed })
  }
}
