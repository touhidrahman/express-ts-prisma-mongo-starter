import { customAlphabet } from 'nanoid'

export function randomId(n = 10): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', n)()
}
