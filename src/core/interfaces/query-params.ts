export interface CommonQueryParams {
  search?: string
  take?: number
  skip?: number
  orderBy?: 'asc' | 'desc'
  published?: boolean
}

export interface ConversationQueryParams extends CommonQueryParams {
    userId: string
}
