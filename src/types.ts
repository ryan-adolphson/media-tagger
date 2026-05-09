export interface SearchResponse {
  found: string[]
  keyword_count: number
  match_count: number
  not_found: string[]
}

export type ContentType = 'text' | 'image' | 'video'
