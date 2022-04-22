import { get } from 'lodash'
import { Request, Response, NextFunction } from 'express'
import { verifyJwt } from '../modules/auth/jwt.service'
import { reIssueAccessToken } from '../modules/auth/auth.service'

const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, '')

  if (!accessToken) {
    return next()
  }

  const { decoded, expired } = verifyJwt(accessToken, 'access')

  if (decoded) {
    res.locals.user = decoded
    return next()
  }

  const refreshToken = get(req, 'headers.x-refresh')

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken })

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken)
    }

    const result = verifyJwt(newAccessToken as string, 'access')

    res.locals.user = result.decoded
    return next()
  }

  return next()
}

export default deserializeUser
