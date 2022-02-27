import { Prisma } from '@prisma/client'
import dayjs from 'dayjs'
import { Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { AddDocInput } from '../interfaces/inputs'
import { DocQueryParams } from '../interfaces/query-params'
import { uploadS3Object } from '../service/s3.service'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

const logDomain = 'DOC'
const service = prisma.doc
const unlinkFile = util.promisify(fs.unlink)

export async function getAllHandler(req: Request<{}, {}, {}, DocQueryParams>, res: Response) {
  try {
    const userId = res.locals.user.id
    const { search = '', take = 24, skip = 0, orderBy = 'asc', authorId = '', rating = 0, tags = '' } = req.query
    const searchTags = tags.split(',').map((tag) => tag.trim())

    const results = await service.findMany({
      where: {
        userId,
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
    if (!req.file) throw new Error('No file provided')

    const userId = res.locals.user.id
    const userQuota = await prisma.user.findUnique({ where: { id: userId }, select: { quota: true, usedSpace: true } })
    const file: Express.Multer.File = req.file

    if (userQuota && userQuota.usedSpace + file.size > userQuota.quota) {
      throw new Error('Quota exceeded')
    }

    const data = req.body
    const uploadResult = await uploadS3Object(file, userId, `${data.title}_${data.authorName}`)

    if (!uploadResult) throw new Error('Upload failed')

    logger.info(`${logDomain}: Uploaded ${file.mimetype} to ${uploadResult.Location}`)

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
              data: notFoundTags.map((tagName) => ({ name: tagName, user: { connect: { id: userId } } })),
            }
          : undefined,
      },
      assets: {
        create: {
          url: uploadResult.Location,
          bucket: uploadResult.Bucket,
          mimetype: file.mimetype,
          name: uploadResult.Key,
          size: file.size,
          user: { connect: { id: userId } },
        }
      },
      user: { connect: { id: userId } },
    }

    const result = await service.create({
      data: doc,
      include: {
        assets: true,
        author: true,
        tags: { select: { name: true, id: true } },
      }
    })

    await prisma.user.update({
      where: { id: userId },
      data: {
        usedSpace: { increment: file.size },
      }
    })

    await unlinkFile(file.path)

    logger.info(`${logDomain}: Add-doc ${result.id}`)
    res.json(result)
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
