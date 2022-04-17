import { Express, Request, Response } from 'express'
import * as asset from './asset/asset.controller'
import * as auth from './auth/auth.controller'
import * as conversation from './conversation/conversation.controller'
import * as profile from './profile/profile.controller'
import * as user from './user/user.controller'
import { checkToken } from './core/middleware/check-token'
import { requireAdmin, requireUser } from './core/middleware/require-user'
import { uploadLocal, uploadS3 } from './core/middleware/upload'
import validate from './core/middleware/validate'
import { assetQuerySchema } from './asset/asset.schema'
import { authSchema, forgotPasswordSchema, registerSchema, resetPasswordSchema } from './auth/auth.schema'

function routes(app: Express) {
  app.get('/v1/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/v1/auth/register', validate(registerSchema), auth.register)
  app.post('/v1/auth/login', validate(authSchema), auth.login)
  app.delete('/v1/auth/logout', requireUser, auth.logout)
  app.get('/v1/auth/sessions', requireUser, auth.getUserSessions)
  app.post('/v1/auth/forgot-password', validate(forgotPasswordSchema), auth.forgotPassword)
  app.post('/v1/auth/reset-password/:token', checkToken('PasswordReset'), validate(resetPasswordSchema), auth.resetPassword)
  app.post('/v1/auth/change-password', requireUser, validate(resetPasswordSchema), auth.resetPassword)
  app.post('/v1/auth/resend-verification', requireUser, auth.resendVerficiation)
  app.post('/v1/auth/verify-email/:token', checkToken('EmailVerification'), auth.verifyEmail)
  app.post('/v1/auth/change-user-role/:id', requireAdmin, auth.changeUserRole)
  app.post('/v1/auth/disable-user/:id', requireAdmin, auth.disableUser)
  app.post('/v1/auth/change-email/:id', requireUser, validate(forgotPasswordSchema), auth.changeEmail)
  app.post('/v1/auth/change-email/:id/confirm/:token', checkToken('EmailChange'), auth.confirmEmailChange)
  app.post('/v1/auth/create-admin', requireAdmin, validate(registerSchema), auth.createAdminUser)
  app.post('/v1/auth/create-first-admin', validate(registerSchema), auth.createFirstAdmin)
  app.get('/v1/auth/me', requireUser, auth.getUserUsingToken)
  app.get('/v1/auth/refresh', auth.getAccessToken)

  app.get('/v1/user/:id', user.getOne)
  app.patch('/v1/user/:id', requireUser, user.update)

  app.get('/v1/assets', validate(assetQuerySchema), asset.getAssetHandler)
  app.post('/v1/assets', requireUser, uploadLocal.single('file'), asset.uploadAssetHandler)
  app.post('/v1/assets-multi', requireUser, uploadS3.array('files'), asset.uploadMultipleAssetHandler)
  app.delete('/v1/assets', validate(assetQuerySchema), requireUser, asset.deleteAssetHandler)
  app.get('/v1/download', validate(assetQuerySchema), requireUser, asset.downloadAssetHandler)

  app.get('/v1/profiles', profile.getMany)
  app.get('/v1/profiles/:id', profile.getOne)
  app.post('/v1/profiles', requireUser, profile.create)
  app.patch('/v1/profiles/:id', requireUser, profile.update)
  app.delete('/v1/profiles/:id', requireUser, profile.deleteOne)

  app.get('/v1/conversation', conversation.getMany)
  app.get('/v1/conversation/:id/messages', conversation.getMessages)
  app.get('/v1/conversation/:id', conversation.getOne)
  app.post('/v1/conversation', requireUser, conversation.create)
  app.post('/v1/conversation/:id/messages', requireUser, conversation.createMessage)
  app.patch('/v1/conversation/:id', requireUser, conversation.update)
  app.delete('/v1/conversation/:id', requireUser, conversation.deleteOne)

}

export default routes
