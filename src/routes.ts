import { Express, Request, Response } from 'express'
import * as asset from './controller/asset.controller'
import * as auth from './controller/auth.controller'
import { checkToken } from './middleware/check-token'
import { requireAdmin, requireUser } from './middleware/require-user'
import { uploadLocal, uploadS3 } from './middleware/upload'
import validate from './middleware/validate'
import { authSchema, forgotPasswordSchema, registerSchema, resetPasswordSchema } from './schema/auth.schema'

function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/v1/auth/register', validate(registerSchema), auth.registerHandler)
  app.post('/v1/auth/login', validate(authSchema), auth.loginHandler)
  app.delete('/v1/auth/logout', requireUser, auth.logoutHandler)
  app.get('/v1/auth/sessions', requireUser, auth.getUserSessionsHandler)
  app.post('/v1/auth/forgot-password', validate(forgotPasswordSchema), auth.forgotPasswordHandler)
  // prettier-ignore
  app.post('/v1/auth/reset-password/:token', checkToken('PasswordReset'), validate(resetPasswordSchema), auth.resetPasswordHandler)
  app.post('/v1/auth/change-password', requireUser, validate(resetPasswordSchema), auth.resetPasswordHandler)
  app.post('/v1/auth/resend-verification', requireUser, auth.resendVerficiationHandler)
  app.post('/v1/auth/verify-email/:token', checkToken('EmailVerification'), auth.resendVerficiationHandler)
  app.post('/v1/auth/change-user-role/:id', requireAdmin, auth.changeUserRoleHandler)
  app.post('/v1/auth/change-email/:id', requireUser, validate(forgotPasswordSchema), auth.changeEmailHandler)
  app.post('/v1/auth/change-email/:id/confirm/:token', checkToken('EmailChange'), auth.confirmEmailChangeHandler)
  app.post('/v1/auth/create-admin', requireAdmin, validate(registerSchema), auth.createAdminUser)
  app.post('/v1/auth/create-first-admin', validate(registerSchema), auth.createFirstAdmin)

  app.get('/v1/assets/:key', asset.getAssetHandler)
  app.post('/v1/assets', requireUser, uploadLocal.single('file'), asset.uploadAssetHandler)
  app.post('/v1/assets-multi', requireUser, uploadS3.array('files'), asset.uploadMultipleAssetHandler)
  app.delete('/v1/assets/:key', requireUser, asset.deleteAssetHandler)
  app.get('/v1/download/:key', requireUser, asset.downloadAssetHandler)
}

export default routes
