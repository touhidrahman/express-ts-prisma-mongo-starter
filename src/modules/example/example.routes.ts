import { Router } from 'express'
import { hasId } from '../../middleware/has-id'
import { verifyJwt } from '../../middleware/parse-jwt'
import { validateBody, validateQueryParam } from '../../middleware/validate'
import { ManyIdSchema } from '../common/id-param.schema'
import { count, create, deleteMany, deleteOne, getMany, getOne, update } from './example.controller'
import { CountQueryParamsSchema, CreateSchema, FindManyQueryParamsSchema, UpdateSchema } from './example.model'

const router = Router()

router.get('/v1/examples/:id', hasId, getOne)
router.patch('/v1/examples/:id', verifyJwt, hasId, validateBody(UpdateSchema), update)
router.delete('/v1/examples/:id', hasId, deleteOne)
router.get('/v1/examples/count', validateQueryParam(CountQueryParamsSchema), count)
router.post('/v1/examples', verifyJwt, validateBody(CreateSchema), create)
router.get('/v1/examples', validateQueryParam(FindManyQueryParamsSchema), getMany)
router.delete('/v1/examples', verifyJwt, validateBody(ManyIdSchema), deleteMany)

export default router
