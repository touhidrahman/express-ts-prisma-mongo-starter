import { NextFunction, Request, Response, Router } from 'express'
import { requireAdmin, requireUser } from './middleware/require-user'
import { uploadLocal } from './middleware/upload'
import validate from './middleware/validate'
import * as asset from './modules/asset/asset.controller'
import { assetQuerySchema } from './modules/asset/asset.schema'
import authRoutes from './modules/auth/auth.routes'
import * as comment from './modules/comment/comment.controller'
import * as conversation from './modules/conversation/conversation.controller'
import * as like from './modules/like/like.controller'
import * as post from './modules/post/post.controller'
import * as user from './modules/user/user.controller'

const router = Router()

router.get('/v1/healthcheck', (req: Request, res: Response) => res.json({ date: new Date() }))

router.get('/v1/user', user.getMany)
router.get('/v1/user/:id', user.getOne)
router.patch('/v1/user/:id', requireUser, user.update)
router.delete('/v1/user/:id', requireAdmin, user.deleteOne)

router.get('/v1/assets', validate(assetQuerySchema), asset.getAssetHandler)
router.post('/v1/assets', requireUser, uploadLocal.single('file'), asset.uploadAssetHandler)
// app.post('/v1/assets-multi', requireUser, uploadS3.array('files'), asset.uploadMultipleAssetHandler)
router.delete('/v1/assets', validate(assetQuerySchema), requireUser, asset.deleteAssetHandler)
router.get('/v1/download', validate(assetQuerySchema), requireUser, asset.downloadAssetHandler)

router.get('/v1/post', post.getMany)
router.get('/v1/post/:id', post.getOne)
router.post('/v1/post', requireUser, post.create)
router.patch('/v1/post/:id', requireUser, post.update)
router.delete('/v1/post/:id', requireUser, post.deleteOne)

router.get('/v1/comment', comment.getMany)
router.get('/v1/comment/:id', comment.getOne)
router.post('/v1/comment', requireUser, comment.create)
router.patch('/v1/comment/:id', requireUser, comment.update)
router.delete('/v1/comment/:id', requireUser, comment.deleteOne)

router.get('/v1/like', like.getMany)
router.get('/v1/like/:id', like.getOne)
router.post('/v1/like', requireUser, like.create)
router.patch('/v1/like/:id', requireUser, like.update)
router.delete('/v1/like/:id', requireUser, like.deleteOne)

router.get('/v1/conversation', conversation.getMany)
router.get('/v1/conversation/:id/messages', conversation.getMessages)
router.get('/v1/conversation/:id', conversation.getOne)
router.post('/v1/conversation', requireUser, conversation.create)
router.post('/v1/conversation/:id/messages', requireUser, conversation.createMessage)
router.patch('/v1/conversation/:id', requireUser, conversation.update)
router.delete('/v1/conversation/:id', requireUser, conversation.deleteOne)


router.use(authRoutes)

// catch 404 and forward to error handler
// router.use((req, res, next) => {
//     next(createError(404))
// })

// error handler
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500).json(err);
});

export default router
