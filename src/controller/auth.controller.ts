import { Request, Response } from 'express'
import { SignupInput } from '../schema/auth.schema'
import {
  createAccessToken,
  createOrUpdateEmailChangeRecord,
  createOrUpdateEmailVerificationRecord,
  createOrUpdatePasswordResetRecord,
  createRefreshToken,
} from '../service/auth.service'
import {
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendUserEmailChangeEmail,
  sendWelcomeEmail,
} from '../service/mailer.service'
import { generatePasswordHash } from '../service/password.service'
import { createUser, validatePassword } from '../service/user.service'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

export async function registerHandler(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const user = await createUser(req.body)
    const tokenRecord = await createOrUpdateEmailVerificationRecord(user.id)

    await sendWelcomeEmail({
      to: user.email,
      token: tokenRecord.token,
      name: `${user.firstName} ${user.lastName}`,
    })

    logger.info(`AUTH: User created: ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    logger.error(`AUTH: Error creating user: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function createAdminUser(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const user = await createUser({ ...req.body, role: 'ADMIN' })

    logger.info(`AUTH: Admin created : ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    logger.error(`AUTH: Error creating admin: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function createFirstAdmin(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const userExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (userExists) {
      logger.warn(`AUTH: Admin already exists`)
      throw new Error('Admin user already exists')
    }

    const user = await createUser({ ...req.body, role: 'ADMIN' })

    logger.info(`AUTH: First Admin created : ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    logger.error(`AUTH: Error creating first admin: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function verifyEmailHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user.id

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
      },
    })

    logger.info(`AUTH: Email verification success for user ${user.id}`)
    res.status(200).json()
  } catch (e: any) {
    logger.error(`AUTH: Error email verification for user: ${e.message}`)
    return res.status(500).json({ message: e.message })
  }
}

export async function resendVerficiationHandler(req: Request, res: Response) {
  try {
    const user = res.locals.user
    const tokenRecord = await createOrUpdateEmailVerificationRecord(user.id)

    await sendWelcomeEmail({
      to: user.email,
      token: tokenRecord.token,
      name: `${user.firstName} ${user.lastName}`,
    })

    logger.info(`AUTH: Email verification resent for user: ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    logger.error(`AUTH: Error resending email verification for user: ${e.message}`)
    return res.status(500).json({ message: e.message })
  }
}

export async function loginHandler(req: Request, res: Response) {
  const user = await validatePassword(req.body)

  if (!user) {
    logger.warn(`AUTH: Invalid login attempt: ${req.body.email}`)
    return res.status(401).json({message: 'Invalid email or password'})
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
  return res.json({ accessToken, refreshToken })
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user.id

  const sessions = await prisma.session.findMany({
    where: { userId, valid: true },
  })

  logger.info(`AUTH: User sessions retrieved ${userId}`)
  return res.json(sessions)
}

export async function logoutHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session

  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  })

  logger.info(`AUTH: Logout success ${res.locals.user.id}`)

  return res.json({
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
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordResetRecord = await createOrUpdatePasswordResetRecord(user.id)

    await sendPasswordResetEmail({
      to: user.email,
      token: passwordResetRecord.token,
      name: user.firstName + ' ' + user.lastName,
    })

    logger.info(`AUTH: Password reset email sent for user ${user.id}`)
    return res.sendStatus(200)
  } catch (error: any) {
    logger.error(`AUTH: Error sending forgot password email: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function resetPasswordHandler(req: Request, res: Response) {
  try {
    const userId = res.locals.user.id
    const token = req.params.token ?? ''

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: await generatePasswordHash(req.body.password),
      },
    })

    if (token) {
      await sendPasswordResetSuccessEmail({
        to: user.email,
        name: user.firstName + ' ' + user.lastName,
      })
    }

    logger.info(`AUTH: Password reset success for user ${user.id}`)
    res.status(200).json()
  } catch (error: any) {
    logger.error(`AUTH: Error resetting password: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function changeUserRoleHandler(req: Request, res: Response) {
  try {
    const userId = req.params.id
    const role = req.body.role

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    })

    logger.info(`AUTH: User role changed for user ${user.id}`)
    return res.json(user)
  } catch (error: any) {
    logger.error(`AUTH: Error changing user role: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function changeEmailHandler(req: Request, res: Response) {
  try {
    const userId = req.params.id
    const email = req.body.email

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.emailVerified) throw new Error('User not found or email not verified')

    const record = await createOrUpdateEmailChangeRecord(user.id, email)
    await sendUserEmailChangeEmail({
      to: user.email,
      token: record.token,
      name: user.firstName + ' ' + user.lastName,
      userId: user.id,
    })

    logger.info(`AUTH: User email change requested for user ${user.id}`)
    return res.json(user)
  } catch (error: any) {
    logger.error(`AUTH: Error accepting user email change request for user: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function confirmEmailChangeHandler(req: Request, res: Response) {
  try {
    const token = req.params.token
    const userId = req.params.id

    const record = await prisma.emailChange.findFirst({
      where: { token, userId },
      select: { newEmail: true },
    })

    if (!record) throw new Error('Invalid token')

    const user = await prisma.user.update({
      where: { id: userId },
      data: { email: record?.newEmail, emailVerified: true },
    })

    logger.info(`AUTH: User email change confirmed for user ${user?.id}`)
    return res.status(200).json()
  } catch (error: any) {
    logger.error(`AUTH: Error confirming email change for user: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}
