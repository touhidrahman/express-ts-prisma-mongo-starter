import { Request, Response } from 'express'
import { handleStripeEvent } from './stripe.service'
import logger from '../../logger/logger.service'
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../../vars'

const logDomain = 'WEBHOOK'
const stripe = require('stripe')(STRIPE_SECRET_KEY)

export async function webhooksHandler(req: Request, res: Response) {
  if (!STRIPE_WEBHOOK_SECRET) {
    logger.error(`${logDomain}: Stripe webhook secret is not defined.`)
    return res.status(500).json({ message: 'Server is not configured for stripe webhooks' })
  }

  let event = req.body
  try {
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(req.body, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    logger.error(`${logDomain}: Stripe webhook signature verification failed. ${err.message}`)
    return res.sendStatus(400)
  }

  await handleStripeEvent(event)

  res.json({ received: true })
}
