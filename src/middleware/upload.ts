import { makeFileName, s3 } from '../storage/s3.service'
import multer from 'multer'
import multerS3 from 'multer-s3'
import { AWS_BUCKET_NAME } from '../vars'

export const uploadLocal = multer({ dest: 'uploads/' })

// export const uploadS3Folder = function (folder: string) {
//   return multer({
//     limits: {
//       fileSize: 10 * 1024 * 1024,
//     },
//     storage: multerS3({
//       s3,
//       bucket: AWS_BUCKET_NAME,
//       cacheControl: 'max-age=31536000',
//       contentType: multerS3.AUTO_CONTENT_TYPE,
//       metadata: function (req, file, cb) {
//         cb(null, { fieldName: file.fieldname })
//       },
//       key: function (req, file, cb) {
//         cb(null, makeFileName(file.originalname, folder, (req as any).params.id))
//       },
//       acl: 'public-read',
//     }),
//   })
// }

// export const uploadS3 = multer({
//   limits: {
//     fileSize: 10 * 1024 * 1024,
//   },
//   storage: multerS3({
//     s3,
//     bucket: AWS_BUCKET_NAME,
//     cacheControl: 'max-age=31536000',
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: function (req, file, cb) {
//       cb(null, { fieldName: file.fieldname })
//     },
//     key: function (req, file, cb) {
//       cb(null, makeFileName(file.originalname))
//     },
//     acl: 'public-read',
//   }),
// })
