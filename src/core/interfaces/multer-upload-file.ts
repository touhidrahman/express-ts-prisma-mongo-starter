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
