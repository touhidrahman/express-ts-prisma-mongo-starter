import { Express, Request, Response } from 'express'
import {
  deleteAssetHandler,
  downloadAssetHandler,
  getAssetHandler,
  uploadAssetHandler
} from './controller/asset.controller'
import {
  forgotPasswordHandler,
  getUserSessionsHandler,
  loginHandler,
  logoutHandler,
  registerHandler,
  resendVerficiationHandler,
  resetPasswordHandler
} from './controller/auth.controller'
import { checkResetToken, checkVerificationToken } from './middleware/check-token'
import { requireUser } from './middleware/require-user'
import { upload } from './middleware/upload'
import validate from './middleware/validate'
import {
  authSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema
} from './schema/auth.schema'

function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/api/auth/register', validate(registerSchema), registerHandler)
  app.post('/api/auth/login', validate(authSchema), loginHandler)
  app.delete('/api/auth', requireUser, logoutHandler)
  app.get('/api/auth/sessions', requireUser, getUserSessionsHandler)
  app.post('/api/auth/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler)
  app.post(
    '/api/auth/reset-password/:token',
    checkResetToken,
    validate(resetPasswordSchema),
    resetPasswordHandler
  )
  app.post(
    '/api/auth/change-password',
    requireUser,
    validate(resetPasswordSchema),
    resetPasswordHandler
  )
  app.post('/api/auth/resend-verification', requireUser, resendVerficiationHandler)
  app.post('/api/auth/verify-email/:token', checkVerificationToken, resendVerficiationHandler)

  app.get('/api/assets/:key', getAssetHandler)
  app.post('/api/assets', requireUser, upload.single('file'), uploadAssetHandler)
  app.delete('/api/assets/:key', requireUser, deleteAssetHandler)
  app.get('/api/download/:key', requireUser, downloadAssetHandler)
}

export default routes
