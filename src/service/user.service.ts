import { omit } from 'lodash'
import { CreateUserInput } from '../schema/user.schema'
import prisma from '../utils/prisma'
import { comparePassword, generatePasswordHash } from './password.service'

export async function createUser(input: CreateUserInput['body']) {
  try {
    const userExists = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })
    if (userExists) {
      throw new Error('User already exists')
    }
    const password = await generatePasswordHash(input.password)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password,
      },
    })

    return omit(user, 'password')
  } catch (e: any) {
    throw new Error(e)
  }
}

export async function validatePassword({ email, password }: { email: string; password: string }) {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    return false
  }

  const isValid = await comparePassword(password, user.password)

  if (!isValid) return false

  return omit(user, 'password')
}
