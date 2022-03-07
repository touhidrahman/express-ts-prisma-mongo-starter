import { object, z } from 'zod'

export const assetQuerySchema = object({
  query: object({
    key: z
      .string({
        required_error: 'Password is required',
      })
  }),
})
