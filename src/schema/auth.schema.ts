import { object, string, TypeOf, z } from 'zod'

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

const passwordRegex = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})/) // 1 caps, 1 small, 1 number, 1 special

export const resetPasswordSchema = z.object({
  body: z
    .object({
      password: z.string().min(6).max(30).regex(passwordRegex),
      passwordConfirmation: z.string().min(6).max(30),
    })
    .refine((data) => data.password === data.passwordConfirmation, {
      message: 'Passwords do not match',
      path: ['passwordConfirmation'],
    }),
})

export const registerSchema = object({
  body: object({
    firstName: string({
      required_error: 'Firstname is required',
    }),
    lastName: string({
      required_error: 'Lastname is required',
    }),
    password: string({
      required_error: 'Name is required',
    })
      .min(6, 'Password should be minimum 6 chars, including 1 small letter, 1 capital letter, 1 number and 1 special character')
      .max(30)
      .regex(passwordRegex),
    passwordConfirmation: string({
      required_error: 'passwordConfirmation is required',
    }),
    email: string({
      required_error: 'Email is required',
    }).email('Not a valid email'),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }),
})

export type SignupInput = Omit<TypeOf<typeof registerSchema>, 'body.passwordConfirmation'>['body']
export type LoginInput = TypeOf<typeof authSchema>['body']
export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>['body']
