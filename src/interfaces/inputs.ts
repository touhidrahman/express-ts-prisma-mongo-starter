export interface AddDocInput {
    title: string
    description?: string
    publishedOn?: string
    rating?: number
    authorName?: string
    tags?: string // CSV
}