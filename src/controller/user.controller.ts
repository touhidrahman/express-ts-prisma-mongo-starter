import { Request, Response } from 'express'
import { SignupInput } from '../schema/auth.schema'
import { sendWelcomeEmail } from '../service/mailer.service'
import { createUser } from '../service/user.service'
import logger from '../utils/logger'

export async function createUserHandler(req: Request<{}, {}, SignupInput>, res: Response) {
  try {
    const user = await createUser(req.body)
    await sendWelcomeEmail(user.email, `${user.firstName} ${user.lastName}`)

    logger.info(`USER: User created: ${user.id}`)
    return res.send(user)
  } catch (e: any) {
    logger.error(`USER: Error creating user: ${e.message}`)
    return res.status(409).send({ message: e.message })
  }
}
