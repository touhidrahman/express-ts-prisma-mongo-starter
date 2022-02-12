import { z, object, string, TypeOf } from 'zod'

export const authSchema = object({
  body: object({
    email: z.string().email(),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6)
      .max(30),
  }),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
})

export type LoginInput = TypeOf<typeof authSchema>['body']
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>['body']
