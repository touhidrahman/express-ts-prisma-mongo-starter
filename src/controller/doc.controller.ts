import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { Request, Response } from 'express'
import { AddDocInput } from '../interfaces/inputs'
import { CommonQueryParams } from '../interfaces/query-params'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

const logDomain = 'DOC'
const service = prisma.doc

export async function getAllHandler(req: Request<{}, {}, {}, CommonQueryParams>, res: Response) {
  try {
    const { search = '', take = 24, skip = 0, orderBy = 'asc' } = req.query

    const results = await service.findMany({
      where: {
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { tags: { some: { name: { contains: search, mode: 'insensitive' } } } },
                { author: { name: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: { author: true, tags: true, assets: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    })

    res.send(results)
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
      include: {
        author: true,
        assets: true,
        tags: true,
        bookmarks: true,
        notes: true,
      },
    })

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function addHandler(req: Request<{}, {}, AddDocInput>, res: Response) {
  try {
    const data = req.body
    const userId = res.locals.user.id
    const inputTags = data.tags?.split(',').map((x) => x.trim()) || []
    const foundAuthor = await prisma.author.findFirst({ where: { name: { equals: data.authorName }, userId } })
    const foundTags = await prisma.tag.findMany({ where: { name: { in: inputTags } } })
    const notFoundTags = inputTags.filter((x) => !foundTags.map((y) => y.name).includes(x))

    const doc: Prisma.DocCreateInput = {
      title: data.title,
      publishedOn: data.publishedOn ? dayjs(data.publishedOn).toDate() : null,
      rating: Number(data.rating),
      author: {
        connect: foundAuthor ? { id: foundAuthor.id } : undefined,
        create: foundAuthor ? undefined : { name: data.authorName ?? '', user: { connect: { id: userId } } },
      },
      tags: {
        connect: foundTags.map((tag) => ({ id: tag.id })),
        createMany: notFoundTags.length
          ? {
              data: notFoundTags.map((tagName) => ({ name: tagName })),
            }
          : undefined,
      },
      user: { connect: { id: userId } },
    }
    const result = await service.create({
      data: doc,
    })

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function createHandler(req: Request<{}, {}, Prisma.DocCreateManyInput>, res: Response) {
  try {
    const data = req.body
    const result = await service.create({
      data: {
        ...data,
      },
    })

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function updateHandler(req: Request<{ id: string }, {}, Prisma.DocCreateManyInput>, res: Response) {
  try {
    const data = req.body
    const result = await service.update({
      where: { id: req.params.id },
      data: {
        ...data,
      },
    })

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}

export async function deleteHandler(req: Request<{ id: string }, {}>, res: Response) {
  try {
    const result = await service.delete({
      where: { id: req.params.id },
    })

    res.send(result)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).send({ message: error.message })
  }
}
