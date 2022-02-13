import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
import config from 'config'
import dayjs from 'dayjs'
import { randomId } from '../utils/id'

export type MulterUploadedFile = {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  bucket: string
  key: string
  acl: string
  contentType: string
  contentDisposition: string
  contentEncoding: string
  storageClass: string
  serverSideEncryption: string
  metadata: { fieldName: string }
  location: string
  etag: string
  versionId: undefined
}

export const accessKeyId = config.get<string>('awsAccessKeyId')
export const secretAccessKey = config.get<string>('awsSecretAccessKey')
export const bucket = config.get<string>('awsBucketName')
export const region = config.get<string>('awsDefaultRegion')

export const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

export function makeFileName(originalFileName: string, folder = '', subfolder = '') {
  const ext = originalFileName.split('.').slice(-1)
  const generatedName = `${dayjs().format('YYYYMMDD_HHmmss')}_${randomId()}.${ext}`
  if (folder && subfolder) {
    return `${folder}/${subfolder}/${generatedName}`
  }
  if (folder) {
    return `${folder}/${generatedName}`
  }
  return `${generatedName}`
}

// upload a file
export function uploadS3Object(file: Express.Multer.File, folder = '') {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams: S3.PutObjectRequest = {
    Bucket: bucket ?? '',
    Key: makeFileName(file.originalname, folder),
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }

  return s3.upload(uploadParams).promise()
}

// download file
export function downloadS3Object(fileKey: string) {
  const downloadParams: S3.GetObjectRequest = {
    Bucket: bucket ?? '',
    Key: fileKey,
  }

  return s3.getObject(downloadParams).promise()
}

// delete file
export function deleteS3Object(fileKey: string, versionId?: string) {
  const deleteParams: S3.DeleteObjectRequest = {
    Bucket: bucket ?? '',
    Key: fileKey,
    VersionId: versionId,
  }

  return s3.deleteObject(deleteParams).promise()
}
