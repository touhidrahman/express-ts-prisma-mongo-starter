export const PORT = Number(process.env.PORT) || 3000
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000'
export const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:4200'

export const ACCESS_TOKEN_PRIVATE_KEY = process.env.ACCESS_TOKEN_PRIVATE_KEY || ''
export const ACCESS_TOKEN_PUBLIC_KEY = process.env.ACCESS_TOKEN_PUBLIC_KEY || ''
export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '900s'
export const REFRESH_TOKEN_PRIVATE_KEY = process.env.REFRESH_TOKEN_PRIVATE_KEY || ''
export const REFRESH_TOKEN_PUBLIC_KEY = process.env.REFRESH_TOKEN_PUBLIC_KEY || ''
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '1y'
export const SALT_WORK_FACTOR = Number(process.env.SALT_WORK_FACTOR) || 10

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || ''
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || ''
export const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION || ''
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || ''

export const DATABASE_URL = process.env.DATABASE_URL || ''

export const EMAIL_SENDER_ADDRESS = process.env.EMAIL_SENDER_ADDRESS || ''
export const EMAIL_SENDER_NAME = process.env.EMAIL_SENDER_NAME || ''
export const EMAIL_SMTP_HOST = process.env.EMAIL_SMTP_HOST || ''
export const EMAIL_SMTP_PASSWORD = process.env.EMAIL_SMTP_PASSWORD || ''
export const EMAIL_SMTP_PORT = Number(process.env.EMAIL_SMTP_PORT) || 587
export const EMAIL_SMTP_USER = process.env.EMAIL_SMTP_USER || ''

export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
export const REDIS_URL = process.env.REDIS_URL || ''

export const STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || ''
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || ''
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''