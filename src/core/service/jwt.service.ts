import jwt from 'jsonwebtoken'
import { ACCESS_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_KEY } from '../../vars'

export function signJwt(
  object: Object,
  keyType: 'access' | 'refresh',
  options?: jwt.SignOptions | undefined,
) {
  const signingKey = encodeKey(keyType)

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

export function verifyJwt(token: string, keyType: 'access' | 'refresh') {
  const publicKey = encodeKey(keyType)

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

function encodeKey(keyType: 'access' | 'refresh') {
  const key: string = keyType === 'access' ? ACCESS_TOKEN_PRIVATE_KEY : REFRESH_TOKEN_PRIVATE_KEY
  return Buffer.from(key, 'base64').toString('ascii')
}