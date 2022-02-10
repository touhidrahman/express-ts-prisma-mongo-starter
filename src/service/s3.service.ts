import S3 from 'aws-sdk/clients/s3'
import fs from 'fs'
import config from 'config'
import dayjs from 'dayjs'

const accessKeyId = config.get<string>('awsAccessKeyId')
const secretAccessKey = config.get<string>('awsSecretAccessKey')
const bucket = config.get<string>('awsBucketName')
const region = config.get<string>('awsDefaultRegion')

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
})

// upload a file
export function uploadFile(file: Express.Multer.File) {
  const fileStream = fs.createReadStream(file.path)

  const uploadParams: S3.PutObjectRequest = {
    Bucket: bucket ?? '',
    Key: dayjs().format('YYYYMMDD_HHmmss') + '_' + file.originalname.split(' ').join('_'),
    Body: fileStream,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }

  return s3.upload(uploadParams).promise()
}

// get file info
export function getFileStream(fileKey: string) {
  const downloadParams: S3.GetObjectRequest = {
    Bucket: bucket ?? '',
    Key: fileKey,
  }

  return s3.getObject(downloadParams).createReadStream()
}
