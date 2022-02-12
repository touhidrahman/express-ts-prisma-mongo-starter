import { object, string, TypeOf } from 'zod'

export const updateUserSchema = object({
  body: object({
    firstName: string({
      required_error: 'Firstname is required',
    }),
    lastName: string({
      required_error: 'Lastname is required',
    }),
    // todo
  }),
})

export type UpdateUserInput = TypeOf<typeof updateUserSchema>['body']
