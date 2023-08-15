import { Request, Response } from 'express'
import { CountRequestQueryParams, CreateInput, FindManyQueryParams, UpdateInput, entity } from './example.model'
import { doCache, fromCache } from '../../cache/cache.service'
import { ManyIdInput } from '../common/id-param.schema'
import service from './example.service'
import { entityLogger } from '../../logger/logger.service'
import { buildResponseMessages } from '../../utils/response-messages.util'

const log = entityLogger(entity)
const resMessages = buildResponseMessages(entity)
const useCaching = false

export async function getMany(req: Request<{}, {}, {}, FindManyQueryParams>, res: Response) {
    try {
        const cacheKey = `${entity}:${JSON.stringify(req.query)}`
        if (useCaching) {
            const cached = await fromCache(cacheKey)
            if (cached) return res.json(cached)
        }

        const result = await service.find(req.query)

        useCaching && (await doCache(cacheKey, result))

        res.json(result)
    } catch (error: any) {
        log.error(error.message)
        res.status(500).json({ message: resMessages.serverError, error })
    }
}

export async function count(req: Request<{}, {}, {}, CountRequestQueryParams>, res: Response) {
    try {
        const cacheKey = `${entity}:${JSON.stringify(req.query)}:count`
        if (useCaching) {
            const cached = await fromCache(cacheKey)
            if (cached) return res.json(cached)
        }

        const result = await service.count(req.query)

        useCaching && (await doCache(cacheKey, result))

        res.status(200).json(result)
    } catch (error: any) {
        log.error(error.message)
        res.status(500).json({ message: resMessages.serverError, error })
    }
}

export async function getOne(req: Request, res: Response) {
    try {
        const { id } = req.params

        const cacheKey = `${entity}:${id}`
        if (useCaching) {
            const cached = await fromCache(cacheKey)
            if (cached) return res.json(cached)
        }

        const result = await service.findById(id)
        if (!result) {
            return res.status(404).json({ message: resMessages.notFound })
        }

        useCaching && (await doCache(cacheKey, result))

        return res.json(result)
    } catch (error: any) {
        log.error(`${resMessages.notFound}. ${error.message}`)
        return res.status(400).json({ message: error.message, error })
    }
}

export async function create(req: Request<{}, {}, CreateInput>, res: Response) {
    try {
        const result = await service.create(req.body)

        log.info(resMessages.created)
        res.status(201).json(result)
    } catch (error: any) {
        log.error(`${resMessages.createFailed}. ${error.message}`)
        res.status(500).json({ message: resMessages.createFailed, error })
    }
}

export async function update(req: Request<{ id: string }, {}, UpdateInput>, res: Response) {
    try {
        const { id } = req.params
        const result = await service.update(id, req.body)

        log.info(resMessages.updated)
        res.status(200).json(result)
    } catch (error: any) {
        log.error(`${resMessages.updateFailed}. ${error.message}`)
        res.status(500).json({ message: resMessages.updateFailed, error })
    }
}

export async function deleteOne(req: Request<{ id: string }, {}>, res: Response) {
    try {
        const { id } = req.params
        const result = await service.delete(id)

        log.info(resMessages.deleted)
        res.status(204).json(result)
    } catch (error: any) {
        log.error(`${resMessages.deleteFailed}. ${error.message}`)
        res.status(500).json({ message: resMessages.deleteFailed, error })
    }
}

export async function deleteMany(req: Request<{}, {}, ManyIdInput>, res: Response) {
    try {
        const { ids } = req.body
        const result = await service.deleteMany(ids)

        log.info(resMessages.deleted)
        res.status(204).json(result)
    } catch (error: any) {
        log.error(`${resMessages.deleteFailed}. ${error.message}`)
        res.status(500).json({ message: resMessages.deleteFailed, error })
    }
}
