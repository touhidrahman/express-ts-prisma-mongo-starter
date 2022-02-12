import { Express, Request, Response } from 'express'
import { deleteAssetHandler, downloadAssetHandler, getAssetHandler, uploadAssetHandler } from './controller/asset.controller'
import {
  changeUserRoleHandler, createAdminUser, forgotPasswordHandler,
  getUserSessionsHandler,
  loginHandler,
  logoutHandler, registerHandler,
  resendVerficiationHandler,
  resetPasswordHandler
} from './controller/auth.controller'
import { checkResetToken, checkVerificationToken } from './middleware/check-token'
import { requireAdmin, requireUser } from './middleware/require-user'
import { upload } from './middleware/upload'
import validate from './middleware/validate'
import { authSchema, forgotPasswordSchema, registerSchema, resetPasswordSchema } from './schema/auth.schema'


function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/v1/auth/register', validate(registerSchema), registerHandler)
  app.post('/v1/auth/login', validate(authSchema), loginHandler)
  app.delete('/v1/auth/logout', requireUser, logoutHandler)
  app.get('/v1/auth/sessions', requireUser, getUserSessionsHandler)
  app.post('/v1/auth/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler)
  app.post('/v1/auth/reset-password/:token', checkResetToken, validate(resetPasswordSchema), resetPasswordHandler)
  app.post('/v1/auth/change-password', requireUser, validate(resetPasswordSchema), resetPasswordHandler)
  app.post('/v1/auth/resend-verification', requireUser, resendVerficiationHandler)
  app.post('/v1/auth/verify-email/:token', checkVerificationToken, resendVerficiationHandler)
  app.post('/v1/auth/change-user-role/:id', requireAdmin, changeUserRoleHandler)
  app.post('/v1/auth/create-admin', validate(registerSchema), createAdminUser)

  app.get('/v1/assets/:key', getAssetHandler)
  app.post('/v1/assets', requireUser, upload.single('file'), uploadAssetHandler)
  app.delete('/v1/assets/:key', requireUser, deleteAssetHandler)
  app.get('/v1/download/:key', requireUser, downloadAssetHandler)
}

export default routes
