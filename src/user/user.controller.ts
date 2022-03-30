import { Prisma, User } from '@prisma/client'
import { Request, Response } from 'express'
import logger from '../core/service/logger.service'
import prisma from '../core/db/prisma'
import { buildResponseMessages } from '../core/utils/response-messages.util'

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

export async function getOne(req: Request, res: Response) {
  try {
    const user = await service.findUnique({
      where: { id: req.params.id },
    })
    if (!user) {
      return res.status(400).send({ message: resMessages.notFound })
    }

    return res.json(getSafeUser(user))
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
