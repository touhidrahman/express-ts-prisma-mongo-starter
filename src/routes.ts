import { Express, Request, Response } from 'express'
import {
  deleteAssetHandler,
  downloadAssetHandler,
  getAssetHandler,
  uploadAssetHandler,
} from './controller/asset.controller'
import {
  forgotPasswordHandler,
  getUserSessionsHandler,
  loginHandler,
  logoutHandler,
  resetPasswordHandler,
} from './controller/auth.controller'
import { createUserHandler } from './controller/user.controller'
import requireUser from './middleware/requireUser'
import { upload } from './middleware/upload'
import validate from './middleware/validateResource'
import {
  authSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
} from './schema/auth.schema'

function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/api/users', validate(registerSchema), createUserHandler)

  app.post('/api/auth', validate(authSchema), loginHandler)
  app.delete('/api/auth', requireUser, logoutHandler)
  app.get('/api/auth/sessions', requireUser, getUserSessionsHandler)
  app.post('/api/auth/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler)
  app.post('/api/auth/reset-password/:token', validate(resetPasswordSchema), resetPasswordHandler)

  // TODO guard user
  app.post('/api/assets', upload.single('file'), uploadAssetHandler)
  app.get('/api/assets/:key', getAssetHandler)
  app.delete('/api/assets/:key', deleteAssetHandler)
  app.get('/api/download/:key', downloadAssetHandler)
}

export default routes
