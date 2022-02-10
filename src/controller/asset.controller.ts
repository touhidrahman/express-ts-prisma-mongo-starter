import { Request, Response } from 'express'
import fs from 'fs'
import util from 'util'
import { getMimeType } from 'stream-mime-type'
import { getFileStream, uploadFile } from '../service/s3.service'

const unlinkFile = util.promisify(fs.unlink)

export async function uploadAssetHandler(req: Request, res: Response) {
  if (!req.file) throw new Error('No file provided')

  const file: Express.Multer.File = req.file

  if (file.size > 10000000) throw new Error('File too large')

  const result = await uploadFile(file)
  if (!result) throw new Error('Upload failed')

  await unlinkFile(file.path)

  return res.send({ filePath: `/assets/${result.Key}` })
}

export async function getAssetHandler(req: Request, res: Response) {
  try {
    const key = req.params.key
    const readStream = getFileStream(key)
    const { stream, mime } = await getMimeType(readStream)

    res.writeHead(200, {
      'Content-Type': mime,
    })

    stream.pipe(res)
  } catch (error: any) {
    res.status(500).send(error.message)
  }
}
