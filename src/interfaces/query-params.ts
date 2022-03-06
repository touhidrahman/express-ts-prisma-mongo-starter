export interface CommonQueryParams {
  search?: string
  take?: number
  skip?: number
  orderBy?: 'asc' | 'desc'
}

export interface DocQueryParams extends CommonQueryParams {
  tagId?: string
  authorId?: string
  rating?: number
  sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'publishedOn' | 'rating'
}