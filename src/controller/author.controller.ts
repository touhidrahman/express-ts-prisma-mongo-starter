import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { AddDocInput } from '../interfaces/inputs'
import { CommonQueryParams, DocQueryParams } from '../interfaces/query-params'
import { uploadS3Object } from '../service/s3.service'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

const logDomain = 'AUTHOR'
const service = prisma.author

export async function getAllHandler(req: Request<{}, {}, {}, CommonQueryParams>, res: Response) {
  try {
    const userId = res.locals.user.id
    const { search = '', take = 24, skip = 0, orderBy = 'asc' } = req.query

    const results = await service.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
          AND: [
            { userId },
          ]
      },
      select: { id: true, name: true, image: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        name: orderBy,
      },
    })

    res.json(results)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function getOneHandler(req: Request<{ id: string }>, res: Response) {
  try {
    const { id } = req.params

    const result = await service.findUnique({
      where: { id },
      select: { id: true, name: true },
    })

    res.json(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function createHandler(req: Request<{}, {}, Prisma.TagCreateManyInput>, res: Response) {
  try {
    const data = req.body
    const result = await service.create({
      data: {
        ...data,
        userId: res.locals.user.id,
      },
    })

    res.json(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function updateHandler(req: Request<{ id: string }, {}, Prisma.TagCreateManyInput>, res: Response) {
  try {
    const data = req.body
    const result = await service.update({
      where: { id: req.params.id },
      data: {
        ...data,
      },
    })

    res.json(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function deleteHandler(req: Request<{ id: string }, {}>, res: Response) {
  try {
    await service.delete({ where: { id: req.params.id } })

    res.status(204).send()
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}
