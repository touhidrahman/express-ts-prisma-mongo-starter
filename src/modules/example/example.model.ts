import { Prisma } from '@prisma/client'
import { z } from 'zod'
import {
    CreateExampleSchema,
    ExampleCountQueryParamsSchema,
    ExampleFindManyQueryParamsSchema,
    UpdateExampleSchema,
} from './example.schema'

export const entity = 'post' // TODO: change

export type CreateExampleInput = z.infer<typeof CreateExampleSchema>
export type UpdateExampleInput = z.infer<typeof UpdateExampleSchema>
export type ExampleFindManyQueryParams = z.infer<typeof ExampleFindManyQueryParamsSchema>
export type ExampleCountQueryParams = z.infer<typeof ExampleCountQueryParamsSchema>

// Only to be imported by other files of this module
export const CreateSchema = CreateExampleSchema
export const UpdateSchema = UpdateExampleSchema
export const FindManyQueryParamsSchema = ExampleFindManyQueryParamsSchema
export const CountQueryParamsSchema = ExampleCountQueryParamsSchema

export type CreateInput = CreateExampleInput | Prisma.CustomerCreateManyInput // TODO: keep one
export type UpdateInput = UpdateExampleInput | Partial<Prisma.CustomerCreateManyInput> // TODO: keep one
export type FindManyQueryParams = ExampleFindManyQueryParams & { sortBy?: keyof UpdateInput }
export type CountRequestQueryParams = ExampleCountQueryParams
