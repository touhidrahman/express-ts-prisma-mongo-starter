import { Request, Response } from 'express'
import prisma from '../../db/prisma'
import { entityLogger } from '../../logger/logger.service'
import { createUser, validatePassword } from '../user/user.service'
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendUserEmailChangeEmail, sendWelcomeEmail } from './auth-mails.service'
import { SignupInput } from './auth.schema'
import {
  createAccessToken,
  createOrUpdateEmailChangeRecord,
  createOrUpdateEmailVerificationRecord,
  createOrUpdatePasswordResetRecord,
  createRefreshToken
} from './auth.service'
import { generatePasswordHash } from './password.service'

const log = entityLogger('AUTH')

export async function register(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const user = await createUser(req.body)
    const tokenRecord = await createOrUpdateEmailVerificationRecord(user.id)

    await sendWelcomeEmail({
      to: user.email,
      token: tokenRecord.token,
      name: `${user.firstName} ${user.lastName}`,
    })

    log.info(`User created: ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    log.error(`Error creating user: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function createAdminUser(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const user = await createUser({ ...req.body, role: 'ADMIN' })

    log.info(`Admin created : ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    log.error(`Error creating admin: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function createFirstAdmin(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const userExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (userExists) {
      log.warn(`Admin already exists`)
      throw new Error('Admin user already exists')
    }

    const user = await createUser({ ...req.body, role: 'ADMIN' })

    log.info(`First Admin created : ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    log.error(`Error creating first admin: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const userId = res.locals.user.id

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
      },
    })

    log.info(`Email verification success for user ${user.id}`)
    res.status(200).json()
  } catch (e: any) {
    log.error(`Error email verification for user: ${e.message}`)
    return res.status(500).json({ message: e.message })
  }
}

export async function resendVerficiation(req: Request, res: Response) {
  try {
    const user = res.locals.user
    const tokenRecord = await createOrUpdateEmailVerificationRecord(user.id)

    await sendWelcomeEmail({
      to: user.email,
      token: tokenRecord.token,
      name: `${user.firstName} ${user.lastName}`,
    })

    log.info(`Email verification resent for user: ${user.id}`)
    return res.json(user)
  } catch (e: any) {
    log.error(`Error resending email verification for user: ${e.message}`)
    return res.status(500).json({ message: e.message })
  }
}

export async function login(req: Request, res: Response) {
  const user = await validatePassword(req.body)

  if (!user) {
    log.warn(`Invalid login attempt: ${req.body.email}`)
    return res.status(401).json({ message: 'Invalid email or password' })
  }

  if (user.disabled) {
    log.warn(`Disabled user login attempt: ${req.body.email}`)
    return res.status(403).json({ message: 'Your account was disabled' })
  }

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      userAgent: req.get('user-agent') ?? '',
    },
  })

  const accessToken = createAccessToken(user, session.id)
  const refreshToken = createRefreshToken(user, session.id)

  log.info(`Login success for user ${user.email}`)
  return res.json({ accessToken, refreshToken })
}

export async function getUserSessions(req: Request, res: Response) {
  const userId = res.locals.user.id

  const sessions = await prisma.session.findMany({
    where: { userId, valid: true },
  })

  log.info(`User sessions retrieved ${userId}`)
  return res.json(sessions)
}

export async function logout(req: Request, res: Response) {
  const sessionId = res.locals.user.session

  await prisma.session.update({
    where: { id: sessionId },
    data: { valid: false },
  })

  log.info(`Logout success ${res.locals.user.id}`)

  return res.json({
    accessToken: null,
    refreshToken: null,
  })
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const email = req.body.email

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      log.warn(`Password reset request for unknown user ${req.body.email}`)
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordResetRecord = await createOrUpdatePasswordResetRecord(user.id)

    await sendPasswordResetEmail({
      to: user.email,
      token: passwordResetRecord.token,
      name: user.firstName + ' ' + user.lastName,
    })

    log.info(`Password reset email sent for user ${user.id}`)
    return res.status(200).json({ message: 'Password reset email sent' })
  } catch (error: any) {
    log.error(`Error sending forgot password email: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function resetPassword(req: Request, res: Response) {
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

    log.info(`Password reset success for user ${user.id}`)
    res.status(200).json({ message: 'Password reset success' })
  } catch (error: any) {
    log.error(`Error resetting password: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function changeUserRole(req: Request, res: Response) {
  try {
    const userId = req.params.id
    const role = req.body.role

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
      },
    })

    log.info(`User role changed for user ${user.id}`)
    return res.json(user)
  } catch (error: any) {
    log.error(`Error changing user role: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function changeEmail(req: Request, res: Response) {
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

    log.info(`User email change requested for user ${user.id}`)
    return res.json(user)
  } catch (error: any) {
    log.error(`Error accepting user email change request for user: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function confirmEmailChange(req: Request, res: Response) {
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

    log.info(`User email change confirmed for user ${user?.id}`)
    return res.status(200).json()
  } catch (error: any) {
    log.error(`Error confirming email change for user: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function getUserUsingToken(req: Request, res: Response) {
  try {
    const user = res.locals.user
    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json({ ...user, password: undefined })
  } catch (e: any) {
    log.error(`Error getting user: ${e.message}`)
    return res.status(409).json({ message: e.message })
  }
}

export async function disableUser(req: Request<{ id: string }>, res: Response) {
  try {
    const userId = req.params.id

    const user = await prisma.user.update({
      where: { id: userId },
      data: { disabled: true, emailVerified: false, sessions: { deleteMany: { userId } } },
    })

    log.info(`User disabled. User ID: ${user?.id}`)
    return res.status(200).json()
  } catch (error: any) {
    log.error(`Error disabling user: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}

export async function getAccessToken(req: Request, res: Response) {
  try {
    const refreshToken = req.headers['X-Refresh-Token'] as string

    // TODO
    return res.status(200).json()
  } catch (error: any) {
    log.error(`Error issuing access token: ${error.message}`)
    return res.status(500).json({ message: error.message })
  }
}
