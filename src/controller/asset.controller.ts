import { Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { deleteS3Object, downloadS3Object, uploadS3Object } from '../service/s3.service'
import logger from '../utils/logger'
import prisma from '../utils/prisma'
const unlinkFile = util.promisify(fs.unlink)

export async function uploadAssetHandler(req: Request, res: Response) {
  try {
    if (!req.file) throw new Error('No file provided')

    const file: Express.Multer.File = req.file

    if (file.size > 10000000) throw new Error('File too large')

    const folder = req.query['directory'] || req.query['folder'] || ''
    const result = await uploadS3Object(file, folder as string)
    if (!result) throw new Error('Upload failed')

    await prisma.asset.create({
      data: {
        url: result.Location,
        bucket: result.Bucket,
        mimetype: file.mimetype,
        name: result.Key,
        size: file.size,
      },
    })

    await unlinkFile(file.path)

    logger.info(`ASSET: Uploaded ${file.mimetype} to ${result.Location}`)
    return res.send({ filePath: `/assets/${result.Key}` })
  } catch (error: any) {
    logger.warn(`ASSET: ${error.message}`)
    res.status(500).send({message: error.message})
  }
}

export async function getAssetHandler(req: Request, res: Response) {
  try {
    const key = req.params.key
    const fileObj = await downloadS3Object(key)

    res.setHeader('Content-Type', fileObj.ContentType ?? '')
    res.send(fileObj.Body)
    res.end()

    logger.info(`ASSET: Get ${key}`)
  } catch (error: any) {
    logger.warn(`ASSET: ${error.message}`)
    res.status(500).send({message: error.message})
  }
}

export async function downloadAssetHandler(req: Request, res: Response) {
  try {
    const key = req.params.key
    const downloadedFile = await downloadS3Object(key)

    res.setHeader('Content-Disposition', `attachment; filename=${key}`)
    res.setHeader('Content-Type', downloadedFile.ContentType ?? '')
    res.send(downloadedFile.Body)
    res.end()
    logger.info(`ASSET: Download ${key}`)
  } catch (error: any) {
    logger.warn(`ASSET: ${error.message}`)
    res.status(500).send({message: error.message})
  }
}

export async function deleteAssetHandler(req: Request, res: Response) {
  try {
    const key = req.params.key

    const deletedFile = await deleteS3Object(key)
    if (!deletedFile) throw new Error('Delete failed')

    const removeRecord = await prisma.asset.deleteMany({
      where: { name: key },
    })

    logger.info(`ASSET: Deleted ${key}`)
    logger.info(`ASSET: Deleted ${removeRecord.count} records`)
    res.sendStatus(200)
  } catch (error: any) {
    logger.warn(`ASSET: ${error.message}`)
    res.status(500).send({message: error.message})
  }
}
