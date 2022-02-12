import { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma'

export const checkToken = (type: 'EmailChange' | 'EmailVerification' | 'PasswordReset') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token
      let record

      if (type === 'EmailChange') {
        record = await prisma.emailChange.findFirst({
          where: { token },
          select: { validUntil: true, user: true },
        })
      }
      if (type === 'EmailVerification') {
        record = await prisma.emailVerification.findFirst({
          where: { token },
          select: { validUntil: true, user: true },
        })
      }
      if (type === 'PasswordReset') {
        record = await prisma.passwordReset.findFirst({
          where: { token },
          select: { validUntil: true, user: true },
        })
      }

      if (!record) throw new Error('Invalid token')
      if (record.validUntil < new Date()) throw new Error('Token expired')

      res.locals.user = record.user
      next()
    } catch (error: any) {
      return res.status(401).send({ message: error.message })
    }
  }
}
