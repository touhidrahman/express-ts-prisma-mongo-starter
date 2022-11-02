import * as crypto from 'crypto'

export function randomUUID(): string {
  return crypto.randomUUID()
}

export function randomId(n = 16): string {
  return crypto.randomBytes(n).toString('hex').slice(0, n)
}
