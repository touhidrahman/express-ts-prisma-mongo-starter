import { Express, Request, Response } from 'express'
import {
  getAssetHandler,
  downloadAssetHandler,
  uploadAssetHandler,
  deleteAssetHandler,
} from './controller/asset.controller'
import {
  createUserSessionHandler,
  deleteSessionHandler,
  getUserSessionsHandler,
} from './controller/session.controller'
import { createUserHandler } from './controller/user.controller'
import requireUser from './middleware/requireUser'
import { upload } from './middleware/upload'
import validateResource from './middleware/validateResource'
import { createSessionSchema } from './schema/session.schema'
import { createUserSchema } from './schema/user.schema'

function routes(app: Express) {
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200))

  app.post('/api/users', validateResource(createUserSchema), createUserHandler)

  app.post('/api/sessions', validateResource(createSessionSchema), createUserSessionHandler)
  app.get('/api/sessions', requireUser, getUserSessionsHandler)
  app.delete('/api/sessions', requireUser, deleteSessionHandler)

  // TODO guard user
  app.post('/api/assets', upload.single('file'), uploadAssetHandler)
  app.get('/api/assets/:key', getAssetHandler)
  app.delete('/api/assets/:key', deleteAssetHandler)
  app.get('/api/download/:key', downloadAssetHandler)
}

export default routes
