import { bucket, makeFileName, s3 } from '../service/s3.service'
import multer from 'multer'
import multerS3 from 'multer-s3'

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
