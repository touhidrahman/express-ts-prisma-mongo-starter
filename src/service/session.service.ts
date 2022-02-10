import config from 'config'
import { get } from 'lodash'
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
