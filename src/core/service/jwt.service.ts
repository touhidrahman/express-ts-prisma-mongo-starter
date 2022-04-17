import jwt from 'jsonwebtoken'

export function signJwt(
  object: Object,
  keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY',
  options?: jwt.SignOptions | undefined,
) {
  const key = process.env[keyName] as string
  const signingKey = Buffer.from(key, 'base64').toString('ascii')

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

export function verifyJwt(token: string, keyName: 'ACCESS_TOKEN_PRIVATE_KEY' | 'REFRESH_TOKEN_PRIVATE_KEY') {
  const publicKey = Buffer.from(process.env[keyName] as string, 'base64').toString('ascii')

  try {
    const decoded = jwt.verify(token, publicKey)
    return {
      valid: true,
      expired: false,
      decoded,
    }
  } catch (e: any) {
    console.error(e)
    return {
      valid: false,
      expired: e.message === 'jwt expired',
      decoded: null,
    }
  }
}
