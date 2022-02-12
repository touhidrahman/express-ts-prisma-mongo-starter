import { Express, Request, Response } from 'express'
import {
  getAssetHandler,
  downloadAssetHandler,
  uploadAssetHandler,
  deleteAssetHandler,
} from './controller/asset.controller'
import {
  loginHandler,
  logoutHandler,
  getUserSessionsHandler,
  forgotPasswordHandler,
} from './controller/auth.controller'
import { createUserHandler } from './controller/user.controller'
import requireUser from './middleware/requireUser'
import { upload } from './middleware/upload'
import validate from './middleware/validateResource'
import { authSchema, forgotPasswordSchema } from './schema/auth.schema'
import { createUserSchema } from './schema/user.schema'

function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/api/users', validate(createUserSchema), createUserHandler)

  app.post('/api/auth', validate(authSchema), loginHandler)
  app.delete('/api/auth', requireUser, logoutHandler)
  app.get('/api/auth/sessions', requireUser, getUserSessionsHandler)
  app.post('/api/auth/forgot-password', validate(forgotPasswordSchema), forgotPasswordHandler)

  // TODO guard user
  app.post('/api/assets', upload.single('file'), uploadAssetHandler)
  app.get('/api/assets/:key', getAssetHandler)
  app.delete('/api/assets/:key', deleteAssetHandler)
  app.get('/api/download/:key', downloadAssetHandler)
}

export default routes
