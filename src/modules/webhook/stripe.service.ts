import logger from '../../logger/logger.service'

const logDomain = 'WEBHOOK_STRIPE'

export async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded':
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break
    case 'payment_method.attached':
      const paymentMethod = event.data.object
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break
    // ... handle other event types
    default:
      logger.warn(`${logDomain}: Unhandled event type ${event.type}`)
  }
}
