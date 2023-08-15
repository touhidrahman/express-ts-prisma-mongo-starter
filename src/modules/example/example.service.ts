import { Prisma } from '@prisma/client'
import prismaClient from '../../db/prisma'
import { getTakeAndSkip } from '../../utils/pagination.util'
import { CountRequestQueryParams, CreateInput, FindManyQueryParams, UpdateInput, entity } from './example.model'

const entityManager = prismaClient[entity]

type WhereInput = Prisma.CustomerWhereInput // TODO: fix
type IncludeInput = Prisma.CustomerInclude // TODO: fix

function buildWhereInput(params: FindManyQueryParams): WhereInput {
    let where: WhereInput = {}
    if (params.search) {
        where = {
            ...where,
            // TODO: fix search logic
            OR: [
                { name: { contains: params.search, mode: 'insensitive' } },
                { note: { contains: params.search, mode: 'insensitive' } },
            ],
        }
    }
    if (params.ids) {
        where = {
            ...where,
            id: { in: params.ids },
        }
    }

    return where
}

function defaultInclude(): IncludeInput {
    return {
        // TODO: add include parameters
    }
}

const service = {
    find: async function (params: FindManyQueryParams, include?: IncludeInput) {
        const { search = '', page, size, orderBy = 'asc', sortBy = 'createdAt' } = params
        const { take, skip } = getTakeAndSkip(page, size)

        const result = await entityManager.findMany({
            where: buildWhereInput({ search }),
            take,
            skip,
            include: include ? include : defaultInclude(),
            orderBy: {
                [sortBy]: orderBy,
            },
        })

        return result
    },

    count: async function (params: CountRequestQueryParams) {
        const { search = '' } = params

        return entityManager.count({
            where: buildWhereInput({ search }),
        })
    },

    findById: async function (id: string, include?: IncludeInput) {
        return entityManager.findUnique({
            where: { id },
            include: include ? include : defaultInclude(),
        })
    },

    findByIds: async function (ids: string[], include?: IncludeInput) {
        return entityManager.findMany({
            where: { id: { in: ids } },
            include: include ? include : defaultInclude(),
        })
    },

    create: async function (data: CreateInput, include?: IncludeInput) {
        return entityManager.create({
            data: {
                ...(data as any), // TODO fix
            },
            include: include ? include : defaultInclude(),
        })
    },

    update: async function (id: string, data: UpdateInput, include?: IncludeInput) {
        return entityManager.update({
            where: { id },
            data: {
                ...(data as any), // TODO fix
            },
            include: defaultInclude(),
        })
    },

    delete: async function (id: string) {
        return entityManager.delete({
            where: { id },
        })
    },

    deleteMany: async function (ids: string[]) {
        return entityManager.deleteMany({
            where: { id: { in: ids } },
        })
    },
}

export default service
