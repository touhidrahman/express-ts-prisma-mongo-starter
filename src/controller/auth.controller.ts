import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { createAccessToken, createRefreshToken } from '../service/auth.service'
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from '../service/mailer.service'
import { generatePasswordHash } from '../service/password.service'
import { validatePassword } from '../service/user.service'
import { randomId } from '../utils/id'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

export async function loginHandler(req: Request, res: Response) {
  const user = await validatePassword(req.body)

  if (!user) {
    logger.warn(`AUTH: Invalid login attempt: ${req.body.email}`)
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

  logger.info(`AUTH: Login success for user ${user.id}`)
  return res.send({ accessToken, refreshToken })
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user.id

  const sessions = await prisma.session.findMany({
    where: { userId, valid: true },
  })

  logger.info(`AUTH: User sessions retrieved ${userId}`)
  return res.send(sessions)
}

export async function logoutHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session

  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  })

  logger.info(`AUTH: Logout success ${res.locals.user.email}`)

  return res.send({
    accessToken: null,
    refreshToken: null,
  })
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  try {
    const email = req.body.email

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      logger.warn(`AUTH: Password reset request for unknown user ${req.body.email}`)
      return res.status(404).send('User not found')
    }

    const passwordResetRecord = await prisma.passwordReset.upsert({
      where: { userId: user.id },
      update: {
        token: randomId(40),
        validUntil: dayjs().add(1, 'day').toDate(),
      },
      create: {
        userId: user.id,
        token: randomId(40),
        validUntil: dayjs().add(1, 'day').toDate(),
      },
    })

    await sendPasswordResetEmail({
      to: user.email,
      token: passwordResetRecord.token,
      name: user.firstName + ' ' + user.lastName,
    })

    logger.info(`AUTH: Password reset email sent for user ${user.id}`)
    return res.sendStatus(200)
  } catch (error: any) {
    logger.error(`AUTH: Error sending forgot password email: ${error.message}`)
    return res.status(500).send(error.message)
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const token = req.params.token

    const passwordResetRecord = await prisma.passwordReset.findFirst({
      where: { token },
    })
    if (!passwordResetRecord) throw new Error('Invalid token')
    if (passwordResetRecord.validUntil < new Date()) throw new Error('Token expired')

    const user = await prisma.user.update({
      where: { id: passwordResetRecord?.userId },
      data: {
        password: await generatePasswordHash(req.body.password),
      },
    })

    await sendPasswordResetSuccessEmail({
      to: user.email,
      name: user.firstName + ' ' + user.lastName,
    })
    await prisma.passwordReset.delete({ where: { id: passwordResetRecord.id } })

    logger.info(`AUTH: Password reset success for user ${user.id}`)
    res.status(200).send()
  } catch (error: any) {
    logger.error(`AUTH: Error resetting password: ${error.message}`)
    return res.status(500).send(error.message)
  }
}
