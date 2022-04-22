import { Prisma } from '@prisma/client'
import { Request, Response } from 'express'
import { CommonQueryParams, ConversationQueryParams } from '../../interfaces/query-params'
import logger from '../../logger/logger.service'
import prisma from '../../db/prisma'
import { buildResponseMessages } from '../../utils/response-messages.util'

const entity = 'conversation'
const logDomain = entity.toUpperCase()
const service = prisma[entity]
const resMessages = buildResponseMessages(entity)
type CreateInput = Prisma.ConversationCreateManyInput
type UpdateInput = Prisma.ConversationUncheckedUpdateInput
interface CreateMessageInput {
  text: string
  receiverId: string
}

export async function getMany(req: Request<{}, {}, {}, ConversationQueryParams>, res: Response) {
  try {
    const { take = 24, skip = 0, orderBy = 'asc', userId } = req.query

    const results = await service.findMany({
      where: {
        OR: [{ senderId: { equals: userId } }, { receiverId: { equals: userId } }],
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    })

    res.send(results)
  } catch (error: any) {
    logger.error(`${logDomain}: ${resMessages.serverError}. ${error.message}`)
    res.status(500).send({ message: resMessages.serverError })
  }
}

export async function getMessages(req: Request<{ id: string }, {}, {}, ConversationQueryParams>, res: Response) {
  try {
    const { take = 24, skip = 0, orderBy = 'desc' } = req.query

    const results = await prisma.message.findMany({
      where: {
        conversation: { id: { equals: req.params.id } },
      },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        createdAt: orderBy,
      },
    })

    res.send(results)
  } catch (error: any) {
    logger.error(`${logDomain}: Couldn't get messages. ${error.message}`)
    res.status(500).send({ message: resMessages.serverError })
  }
}

export async function getOne(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params

    const result = await service.findUnique({
      where: { id },
    })

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

export async function createMessage(req: Request<{ id: string }, {}, CreateMessageInput>, res: Response) {
  try {
    const data = req.body
    const { id } = req.params
    const senderId = res.locals.user.id
    const receiverId = data.receiverId

    const result = await service.update({
      where: { id },
      data: {
        messages: {
          create: {
            text: data.text,
            sender: { connect: { id: senderId } },
            receiver: { connect: { id: receiverId } },
          },
        },
      },
    })

    logger.info(`${logDomain}: ${resMessages.created}.`)
    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: Message create failed. ${error.message}`)
    res.status(500).send({ message: 'Message create failed' })
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
