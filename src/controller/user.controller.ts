import { Request, Response } from 'express'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...req.body },
    })

    logger.info(`USER: User updated: ${user.id}`)
    return res.send(user)
  } catch (e: any) {
    logger.error(`USER: Error updating user: ${e.message}`)
    return res.status(400).send({ message: e.message })
  }
}
