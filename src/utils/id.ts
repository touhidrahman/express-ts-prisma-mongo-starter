import { customAlphabet } from 'nanoid'

/**
 * Get a random ID using only lowercase letters and numbers
 * @param n
 * @returns
 */
export function randomId(n = 10): string {
  return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', n)()
}

/**
 * Confusion Free ID (excludes 0, O, I, l)
 * @param n
 * @returns
 */
export function safeId(n = 6, uppercase = false, numbers = false): string {
  const letters = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const alphabets = (uppercase ? letters.toUpperCase() : letters)
    .concat(numbers ? digits : '')
  return customAlphabet(alphabets, n)()
}
