import { Request, Response } from 'express'
import { createAccessToken, createRefreshToken } from '../service/session.service'
import { validatePassword } from '../service/user.service'
import prisma from '../utils/prisma'

export async function createUserSessionHandler(req: Request, res: Response) {
  const user = await validatePassword(req.body)

  if (!user) {
    return res.status(401).send('Invalid email or password')
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: req.get('user-agent') ?? '',
    },
  })

  const accessToken = createAccessToken(user, session.id)
  const refreshToken = createRefreshToken(user, session.id)

  return res.send({ accessToken, refreshToken })
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user.id

  const sessions = await prisma.session.findMany({
    where: { userId, valid: true },
  })

  return res.send(sessions)
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session

  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  })

  return res.send({
    accessToken: null,
    refreshToken: null,
  })
}
