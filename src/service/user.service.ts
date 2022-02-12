import { omit } from 'lodash'
import { LoginInput, SignupInput } from '../schema/auth.schema'
import prisma from '../utils/prisma'
import { comparePassword, generatePasswordHash } from './password.service'

export async function createUser(input: SignupInput) {
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
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password,
      },
    })

    return omit(user, 'password')
  } catch (e: any) {
    throw new Error(e)
  }
}

export async function validatePassword(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  if (!user) {
    return false
  }

  const isValid = await comparePassword(input.password, user.password)

  if (!isValid) return false

  return omit(user, 'password')
}
