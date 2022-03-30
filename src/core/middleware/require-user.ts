import { Request, Response, NextFunction } from 'express'
import logger from '../service/logger.service'

export const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user) {
    logger.warn(`AUTH: Forbidden access attempted. path: ${req.path}`)
    return res.status(403).json({ message: 'User does not have access' })
  }

  return next()
}

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user

  if (!user || user.role !== 'ADMIN') {
    logger.warn(`AUTH: Forbidden access attempted. path: ${req.path}, user: ${user?.id}`)
    return res.status(403).json({ message: 'User does not have admin privileges' })
  }

  return next()
}
