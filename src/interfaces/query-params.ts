export interface CommonQueryParams {
  search?: string
  take?: number
  skip?: number
  orderBy?: 'asc' | 'desc'
}

export interface DocQueryParams extends CommonQueryParams {
  tags?: string // CSV
  authorId?: string
  rating?: number
}