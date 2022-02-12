import config from 'config'
import dayjs from 'dayjs'
import { get } from 'lodash'
import { randomId } from '../utils/id'
import { signJwt, verifyJwt } from '../utils/jwt.utils'
import prisma from '../utils/prisma'

export function createAccessToken(user: any, sessionId: string): string {
  return signJwt({ ...user, session: sessionId }, 'accessTokenPrivateKey', {
    expiresIn: config.get('accessTokenTtl') ?? '900s',
  })
}

export function createRefreshToken(user: any, sessionId: string): string {
  return signJwt({ ...user, session: sessionId }, 'refreshTokenPrivateKey', {
    expiresIn: config.get('refreshTokenTtl') ?? '900s',
  })
}

export async function reIssueAccessToken({ refreshToken }: { refreshToken: string }) {
  const { decoded } = verifyJwt(refreshToken, 'refreshTokenPublicKey')

  if (!decoded || !get(decoded, 'session')) return false

  const session = await prisma.session.findUnique({
    where: { id: get(decoded, 'session') },
  })

  if (!session || !session.valid) return false

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  if (!user) return false

  return createAccessToken(user, session.id)
}

export async function createOrUpdateEmailVerificationRecord(userId: string) {
  return await prisma.emailVerification.upsert({
    where: { userId: userId },
    update: {
      token: randomId(40),
      validUntil: dayjs().add(1, 'day').toDate(),
    },
    create: {
      token: randomId(40),
      validUntil: dayjs().add(1, 'day').toDate(),
      userId: userId,
    },
  })
}

export async function createOrUpdatePasswordResetRecord(userId: string) {
  return await prisma.passwordReset.upsert({
    where: { userId: userId },
    update: {
      token: randomId(40),
      validUntil: dayjs().add(1, 'day').toDate(),
    },
    create: {
      userId: userId,
      token: randomId(40),
      validUntil: dayjs().add(1, 'day').toDate(),
    },
  })
}
