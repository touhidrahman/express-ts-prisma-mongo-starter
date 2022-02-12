import { Request, Response, NextFunction } from 'express'
import prisma from '../utils/prisma'

export const checkResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token

    const passwordResetRecord = await prisma.passwordReset.findFirst({
      where: { token },
      select: { validUntil: true, user: true },
    })
    if (!passwordResetRecord) throw new Error('Invalid token')
    if (passwordResetRecord.validUntil < new Date()) throw new Error('Token expired')

    res.locals.user = passwordResetRecord.user
    next()
  } catch (error: any) {
    return res.status(401).send(error.message)
  }
}

export const checkVerificationToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token

    const emailVerificationRecord = await prisma.emailVerification.findFirst({
      where: { token },
      select: { validUntil: true, user: true },
    })
    if (!emailVerificationRecord) throw new Error('Invalid token')
    if (emailVerificationRecord.validUntil < new Date()) throw new Error('Token expired')

    res.locals.user = emailVerificationRecord.user
    next()
  } catch (error: any) {
    return res.status(401).send(error.message)
  }
}
