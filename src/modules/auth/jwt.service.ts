import jwt, { VerifyOptions } from 'jsonwebtoken'
import { ACCESS_TOKEN_PRIVATE_KEY, REFRESH_TOKEN_PRIVATE_KEY } from '../../vars'

export function signJwt(object: Object, keyType: 'access' | 'refresh', options?: jwt.SignOptions) {
  const signingKey = encodeKey(keyType)

  return jwt.sign(object, signingKey, {
    ...(options && options),
    algorithm: 'RS256',
  })
}

export function verifyJwt(token: string, keyType: 'access' | 'refresh', options?: VerifyOptions) {
  const publicKey = encodeKey(keyType)

  try {
    const decoded = jwt.verify(token, publicKey, {
      ...(options && options),
      algorithms: ['RS256'],
    })
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
