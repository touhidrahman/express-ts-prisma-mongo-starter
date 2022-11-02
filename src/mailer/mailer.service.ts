import nodemailer from 'nodemailer'
import logger from '../logger/logger.service'
import { EMAIL_SENDER_ADDRESS, EMAIL_SMTP_HOST, EMAIL_SMTP_PASSWORD, EMAIL_SMTP_PORT, EMAIL_SMTP_USER } from '../vars'

const host = EMAIL_SMTP_HOST
const port = EMAIL_SMTP_PORT
const user = EMAIL_SMTP_USER
const pass = EMAIL_SMTP_PASSWORD
const from = EMAIL_SENDER_ADDRESS

const smtpTransport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  },
})

export async function sendMail(to: string, subject: string, text: string, html: string): Promise<void> {
  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  }
  try {
    const sendResult = await smtpTransport.sendMail(mailOptions)
    logger.info(`EMAIL: Email sent: ${sendResult.messageId}`)
  } catch (error) {
    throw new Error(`EMAIL: Error sending email: ${error}`)
  }
}
