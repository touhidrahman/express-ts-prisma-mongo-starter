import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
import dayjs from 'dayjs'
import { randomId } from '../utils/id'
import { AWS_DEFAULT_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_BUCKET_NAME } from '../vars'

export const s3 = new S3({
  region: AWS_DEFAULT_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
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
    Bucket: AWS_BUCKET_NAME,
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
    Bucket: AWS_BUCKET_NAME,
    Key: fileKey,
  }

  return s3.getObject(downloadParams).promise()
}

// delete file
export function deleteS3Object(fileKey: string, versionId?: string) {
  const deleteParams: S3.DeleteObjectRequest = {
    Bucket: AWS_BUCKET_NAME,
    Key: fileKey,
    VersionId: versionId,
  }

  return s3.deleteObject(deleteParams).promise()
}
