import { User } from '@prisma/client'
import { Request, Response } from 'express'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

const logDomain = 'USER'
const service = prisma.user

function getSafeUser(user: User): any {
  return {
    ...user,
    password: undefined,
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const user = await service.findUnique({
      where: { id: req.params.id },
    })
    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    return res.json(getSafeUser(user))
  } catch (e: any) {
    logger.error(`${logDomain}: Error updating user: ${e.message}`)
    return res.status(400).json({ message: e.message })
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...req.body },
    })
    if (!user) {
      return res.status(400).send({ message: 'User not found' })
    }

    return res.json(getSafeUser(user))
  } catch (e: any) {
    logger.error(`${logDomain}: Error updating user: ${e.message}`)
    return res.status(400).json({ message: e.message })
  }
}
