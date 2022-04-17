import bcrypt from 'bcrypt'
import { SALT_WORK_FACTOR } from '../../vars'

export async function generatePasswordHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)

  return await bcrypt.hashSync(password, salt)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
