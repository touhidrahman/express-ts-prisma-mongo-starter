import { Express, Request, Response } from 'express'
import * as asset from './controller/asset.controller'
import * as auth from './controller/auth.controller'
import * as user from './controller/user.controller'
import * as doc from './controller/doc.controller'
import * as tag from './controller/tag.controller'
import * as author from './controller/author.controller'
import { checkToken } from './middleware/check-token'
import { requireAdmin, requireUser } from './middleware/require-user'
import { uploadLocal, uploadS3 } from './middleware/upload'
import validate from './middleware/validate'
import { authSchema, forgotPasswordSchema, registerSchema, resetPasswordSchema } from './schema/auth.schema'

function routes(app: Express) {
  app.get('/v1/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/v1/auth/register', validate(registerSchema), auth.registerHandler)
  app.post('/v1/auth/login', validate(authSchema), auth.loginHandler)
  app.delete('/v1/auth/logout', requireUser, auth.logoutHandler)
  app.get('/v1/auth/sessions', requireUser, auth.getUserSessionsHandler)
  app.post('/v1/auth/forgot-password', validate(forgotPasswordSchema), auth.forgotPasswordHandler)
  app.post('/v1/auth/reset-password/:token', checkToken('PasswordReset'), validate(resetPasswordSchema), auth.resetPasswordHandler)
  app.post('/v1/auth/change-password', requireUser, validate(resetPasswordSchema), auth.resetPasswordHandler)
  app.post('/v1/auth/resend-verification', requireUser, auth.resendVerficiationHandler)
  app.post('/v1/auth/verify-email/:token', checkToken('EmailVerification'), auth.verifyEmailHandler)
  app.post('/v1/auth/change-user-role/:id', requireAdmin, auth.changeUserRoleHandler)
  app.post('/v1/auth/change-email/:id', requireUser, validate(forgotPasswordSchema), auth.changeEmailHandler)
  app.post('/v1/auth/change-email/:id/confirm/:token', checkToken('EmailChange'), auth.confirmEmailChangeHandler)
  app.post('/v1/auth/create-admin', requireAdmin, validate(registerSchema), auth.createAdminUser)
  app.post('/v1/auth/create-first-admin', validate(registerSchema), auth.createFirstAdmin)
  app.get('/v1/auth/me', requireUser, auth.getUserUsingTokenHandler)

  app.get('/v1/user/:id', user.getUserHandler)
  app.patch('/v1/user/:id', requireUser, user.updateUserHandler)

  app.get('/v1/assets', asset.getAssetHandler)
  app.post('/v1/assets', requireUser, uploadLocal.single('file'), asset.uploadAssetHandler)
  app.post('/v1/assets-multi', requireUser, uploadS3.array('files'), asset.uploadMultipleAssetHandler)
  app.delete('/v1/assets/:key', requireUser, asset.deleteAssetHandler)
  app.get('/v1/download/:key', requireUser, asset.downloadAssetHandler)

  app.get('/v1/docs', requireUser, doc.getAllHandler)
  app.get('/v1/docs/count', requireUser, doc.getCountHandler)
  app.get('/v1/docs/:id', requireUser, doc.getOneHandler)
  app.patch('/v1/docs/:id/page-read', requireUser, doc.updatePageReadHandler)
  app.post('/v1/add-doc', requireUser, uploadLocal.single('file'), doc.addHandler)
  app.post('/v1/docs/:id/assets', requireUser, uploadLocal.single('file'), doc.addAssetHandler)
  app.delete('/v1/docs/:id/assets/:assetId', requireUser, doc.deleteAssetHandler)
  app.patch('/v1/docs/:id', requireUser, doc.updateHandler)
  app.delete('/v1/docs/:id', requireUser, doc.deleteHandler)
  app.delete('/v1/docs', requireUser, doc.deleteManyHandler)

  app.get('/v1/tags', requireUser, tag.getAllHandler)
  app.get('/v1/tags/:id', requireUser, tag.getOneHandler)
  app.patch('/v1/tags/:id', requireUser, tag.updateHandler)
  app.delete('/v1/tags/:id', requireUser, tag.deleteHandler)

  app.get('/v1/authors', requireUser, author.getAllHandler)
  app.get('/v1/authors/:id', requireUser, author.getOneHandler)
  app.patch('/v1/authors/:id', requireUser, author.updateHandler)
  app.delete('/v1/authors/:id', requireUser, author.deleteHandler)
}

export default routes
