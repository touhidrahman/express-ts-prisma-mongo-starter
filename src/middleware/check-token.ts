import { Request, Response, NextFunction } from 'express'
import prisma from '../db/prisma'

/**
 * Checks a given token from route param and sets the user (if valid and exists) to req.local.user
 * @param type
 * @returns
 */
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
      return res.status(401).json({ message: error.message })
    }
  }
}
