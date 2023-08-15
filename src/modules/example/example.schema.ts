import z from 'zod'
import { CommonQueryParamsSchema } from '../../interfaces/query-params'

export const CreateExampleSchema = z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string().email(),
    phone: z.string().optional(),
    note: z.string().optional(),
    role: z.string(),
    customerId: z.string(),
    type: z.enum(['None', 'Cloud', 'OnPrem', 'Outsource']),
})

export const UpdateExampleSchema = CreateExampleSchema.partial().extend({
    id: z.string(),
})

export const ExampleFindManyQueryParamsSchema = CommonQueryParamsSchema.extend({
    ids: z.array(z.string()).optional().nullable(),
})

export const ExampleCountQueryParamsSchema = ExampleFindManyQueryParamsSchema.omit({
    page: true,
    size: true,
    orderBy: true,
})
