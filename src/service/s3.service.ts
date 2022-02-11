import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
import config from 'config'
import dayjs from 'dayjs'
import { randomId } from '../utils/id'

const accessKeyId = config.get<string>('awsAccessKeyId')
const secretAccessKey = config.get<string>('awsSecretAccessKey')
const bucket = config.get<string>('awsBucketName')
const region = config.get<string>('awsDefaultRegion')

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

function makeFileName(originalFileName: string, folder = '') {
  const ext = originalFileName.split('.').slice(-1)
  const generatedName = `${dayjs().format('YYYYMMDD_HHmmss')}_${randomId()}.${ext}`
  return folder ? `${folder}/${generatedName}` : `${generatedName}`
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
