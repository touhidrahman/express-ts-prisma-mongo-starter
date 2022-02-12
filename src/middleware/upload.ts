import S3 from 'aws-sdk/clients/s3'
import config from 'config'
import dayjs from 'dayjs'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { randomId } from '../utils/id'

export type MulterUploadedFile = {
  fieldname: string,
  originalname: string,
  encoding: string,
  mimetype: string,
  size: number,
  bucket: string,
  key: string,
  acl: string,
  contentType: string,
  contentDisposition: string,
  contentEncoding: string,
  storageClass: string,
  serverSideEncryption: string,
  metadata: { fieldName: string },
  location: string,
  etag: string,
  versionId: undefined,
}

const accessKeyId = config.get<string>('awsAccessKeyId')
const secretAccessKey = config.get<string>('awsSecretAccessKey')
const bucket = config.get<string>('awsBucketName')
const region = config.get<string>('awsDefaultRegion')

export const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

export function makeFileName(originalFileName: string, folder = '') {
  const ext = originalFileName.split('.').slice(-1)
  const generatedName = `${dayjs().format('YYYYMMDD_HHmmss')}_${randomId()}.${ext}`
  return folder ? `${folder}/${generatedName}` : `${generatedName}`
}

export const uploadLocal = multer({ dest: 'uploads/' })

export const uploadS3 = multer({
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  storage: multerS3({
    s3,
    bucket,
    cacheControl: 'max-age=31536000',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname })
    },
    key: function (req, file, cb) {
      console.log('TCL: | req', (req as any).query)
      cb(null, makeFileName(file.originalname))
    },
    acl: 'public-read',
  }),
})
