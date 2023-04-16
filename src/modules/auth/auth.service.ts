import dayjs from 'dayjs'
import { get } from 'radash'
import { randomId } from '../../utils/id'
import { signJwt, verifyJwt } from './jwt.service'
import prisma from '../../db/prisma'
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../../vars'

export function createAccessToken(user: any, sessionId: string): string {
  return signJwt({ ...user, session: sessionId }, 'access', {
    expiresIn: ACCESS_TOKEN_TTL,
  })
}

export function createRefreshToken(user: any, sessionId: string): string {
  return signJwt({ ...user, session: sessionId }, 'refresh', {
    expiresIn: REFRESH_TOKEN_TTL,
  })
}

export async function reIssueAccessToken({ refreshToken }: { refreshToken: string }) {
  const { decoded } = verifyJwt(refreshToken, 'refresh')

  if (!decoded || !get(decoded, 'session')) return false

  const session = await prisma.session.findUnique({
    where: { id: get(decoded, 'session') as string },
  })

  if (!session || !session.valid) return false

  const user = await prisma.user.findUnique({ where: { id: session.userId } })

  if (!user) return false

  return createAccessToken(user, session.id)
}

function generateTokenAndValidity(length = 40, validDays = 1) {
  return { token: randomId(length), validUntil: dayjs().add(validDays, 'day').toDate() }
}

export async function createOrUpdateEmailChangeRecord(userId: string, newEmail: string) {
  return await prisma.emailChange.upsert({
    where: { userId: userId },
    update: {
      ...generateTokenAndValidity(),
    },
    create: {
      ...generateTokenAndValidity(),
      userId: userId,
      newEmail,
    },
  })
}

export async function createOrUpdateEmailVerificationRecord(userId: string) {
  return await prisma.emailVerification.upsert({
    where: { userId: userId },
    update: {
      ...generateTokenAndValidity(),
    },
    create: {
      ...generateTokenAndValidity(),
      userId: userId,
    },
  })
}

export async function createOrUpdatePasswordResetRecord(userId: string) {
  return await prisma.passwordReset.upsert({
    where: { userId: userId },
    update: {
      ...generateTokenAndValidity(),
    },
    create: {
      userId: userId,
      ...generateTokenAndValidity(),
    },
  })
}
