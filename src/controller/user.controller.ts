import { Request, Response } from 'express'
import { CreateUserInput } from '../schema/user.schema'
import { sendWelcomeEmail } from '../service/mailer.service'
import { createUser } from '../service/user.service'
import logger from '../utils/logger'

export async function createUserHandler(
  req: Request<{}, {}, CreateUserInput['body']>,
  res: Response
) {
  try {
    const user = await createUser(req.body)
    await sendWelcomeEmail(user.email, user.name)

    logger.info(`USER: User created: ${user.id}`)
    return res.send(user)
  } catch (e: any) {
    logger.error(e)
    return res.status(409).send({ message: e.message })
  }
}
