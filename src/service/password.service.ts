import bcrypt from 'bcrypt'
import config from 'config'

export async function generatePasswordHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(config.get<number>('saltWorkFactor') ?? 10)

  return await bcrypt.hashSync(password, salt)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
