import nodemailer from 'nodemailer'
import config from 'config'
import logger from '../utils/logger'

const host = config.get<string>('emailSmtpHost')
const port = config.get<number>('emailSmtpPort')
const user = config.get<string>('emailSmtpUser')
const pass = config.get<string>('emailSmtpPassword')
const from = config.get<string>('emailSenderAddress')
const frontendBaseUrl = config.get<string>('frontendBaseUrl')

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
  const sendResult = await smtpTransport.sendMail(mailOptions)
  logger.info(`EMAIL: Email sent: ${sendResult.messageId}`)
}

export async function sendWelcomeEmail(data: { to: string; name: string; token: string }) {
  const subject = 'Welcome to the Site!'
  const link = `${frontendBaseUrl}/verify-email/${data.token}`
  const text = `Welcome to the site, ${data.name}. Please click on this link to verify your email.\n\n${link}`
  const html = `<body>
    <h1>Welcome to the Site, ${data.name}</h1>
    <p>Please click on this link to verify your email.</p>
    <p><a href="${link}">${link}</a></p>
    </body>`

  await sendMail(data.to, subject, text, html)
}

export async function sendPasswordResetEmail(data: { to: string; name: string; token: string }) {
  const link = `${frontendBaseUrl}/reset-password/${data.token}`
  const subject = 'Your password reset link'
  const text = `Dear ${data.name}, click on the link below to reset your password. The link will expire in 1 day. Link: ${link}`
  const html = `<body>
    <p>Dear ${data.name}, </p>
    <p>Click on the link below to reset your password. The link will expire in 1 day.</p>
    <p><a href=${link}>Reset your password</a></p>
    <p>If the link is not working, copy paste this: ${link}</p>
    </body>`

  await sendMail(data.to, subject, text, html)
}

export async function sendPasswordResetSuccessEmail(data: { to: string; name: string }) {
  const subject = 'Your password was reset successfully'
  const text = `Dear ${data.name}, Your password has been reset successfully. If you have not done it, please take action immediately.`
  const html = `<body>
    <p>Dear ${data.name}, </p>
    <p>Your password has been reset successfully.</p>
    <p>If you have not done it, please take action immediately.</p>
    </body>`

  await sendMail(data.to, subject, text, html)
}
