import config from 'config'
import { Request, Response } from 'express'
import { handleStripeEvent } from '../service/stripe.service'
import logger from '../utils/logger'

const stripe = require('stripe')(config.get<string>('stripeSecretKey'))
const stripeWebhookSecret = config.get<string>('stripeWebhookSecret')

export async function webhooksHandler(req: Request, res: Response) {
  if (!stripeWebhookSecret) {
    logger.error('WEBHOOK: Stripe webhook secret is not defined.')
    return res.status(500).send({ message: 'Server is not configured for stripe webhooks' })
  }

  let event = req.body
  try {
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret)
  } catch (err: any) {
    logger.error(`WEBHOOK: Stripe webhook signature verification failed. ${err.message}`)
    return res.sendStatus(400)
  }

  await handleStripeEvent(event)

  res.json({ received: true })
}
