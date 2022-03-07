import { Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { deleteS3Object, downloadS3Object, MulterUploadedFile, uploadS3Object } from '../service/s3.service'
import logger from '../utils/logger'
import prisma from '../utils/prisma'

const logDomain = 'ASSET'
const unlinkFile = util.promisify(fs.unlink)

/**
 * Use this handler to have more granular control over the upload process in conjunction with the `uploadLocal` middleware.
 * Uploading to S3 is this handler's responsibility.
 */
export async function uploadAssetHandler(req: Request, res: Response) {
  try {
    if (!req.file) throw new Error('No file provided')

    const file: Express.Multer.File = req.file

    if (file.size > 10000000) throw new Error('File too large')

    const folder = req.query['directory'] || req.query['folder'] || ''
    const result = await uploadS3Object(file, folder as string)
    if (!result) throw new Error('Upload failed')

    const record = await prisma.asset.create({
      data: {
        url: result.Location,
        bucket: result.Bucket,
        mimetype: file.mimetype,
        name: result.Key,
        size: file.size,
      },
    })

    await unlinkFile(file.path)

    logger.info(`${logDomain}: Uploaded ${file.mimetype} to ${result.Location}`)
    return res.json(record)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

/**
 * This handler assumes the file is already uploaded to S3.
 */
export async function uploadMultipleAssetHandler(req: Request, res: Response) {
  try {
    const files: MulterUploadedFile[] = req.files as any as MulterUploadedFile[]

    const data = files.map((file) => ({
      url: file.location,
      bucket: file.bucket,
      mimetype: file.mimetype,
      name: file.key,
      size: file.size,
    }))

    await prisma.asset.createMany({ data })

    return res.json(data)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}

export async function getAssetHandler(req: Request<{}, {}, {}, { key: string }>, res: Response) {
  try {
    const key = req.query.key
    const fileObj = await downloadS3Object(key)

    res.setHeader('Content-Type', fileObj.ContentType ?? '')
    res.send(fileObj.Body)
    res.end()

    logger.info(`${logDomain}: Get ${key}`)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).json({ message: error.message })
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
    logger.info(`${logDomain}: Download ${key}`)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).json({ message: error.message })
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

    logger.info(`${logDomain}: Deleted ${key}`)
    logger.info(`${logDomain}: Deleted ${removeRecord.count} records`)
    res.sendStatus(200)
  } catch (error: any) {
    logger.error(`${logDomain}: ${error.message}`)
    res.status(500).json({ message: error.message })
  }
}
