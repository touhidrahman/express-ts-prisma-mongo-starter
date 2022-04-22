import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import prismaClient from '../../db/prisma'
import { CommonQueryParams } from '../../interfaces/query-params'
import { doCache, fromCache } from '../../redis/redis.service'
import { buildResponseMessages } from '../../utils/response-messages.util'
import logger from '../../logger/logger.service'

const entity = 'comment'
const logDomain = entity.toUpperCase()
const service = prismaClient[entity]
const resMessages = buildResponseMessages(entity)
type CreateInput = Prisma.CommentCreateManyInput
type UpdateInput = Prisma.CommentUncheckedUpdateInput
interface CommentQueryParams extends CommonQueryParams {
  postId: string
}

export async function getMany(req: Request<{}, {}, {}, CommentQueryParams>, res: Response) {
  try {
    const { postId = '', take = 24, skip = 0, orderBy = 'desc' } = req.query
    const cacheKey = `${entity}:${JSON.stringify(req.query)}`

    const cached = await fromCache(cacheKey)
    if (cached) return res.json(cached)

    const result = await service.findMany({
      where: {
        post: { id: { equals: postId } }
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        createdAt: orderBy,
      },
    })

    await doCache(cacheKey, result)

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

    const result = await service.findUnique({
      where: { id },
    })

    if (!result) {
      return res.status(400).send({ message: resMessages.notFound })
    }

    await doCache(cacheKey, result)

    return res.json(result)
  } catch (e: any) {
    logger.error(`${logDomain}: ${resMessages.notFound}. ${e.message}`)
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
