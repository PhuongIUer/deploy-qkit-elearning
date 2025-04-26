  export interface ICommonResponse<T> {
    items: T[]
    meta: Meta
  }
  
  export interface ITeachingResponse<T> {
    items: T[] 
    meta: MetaTeaching
  }
  export interface Role {
    id: number
    name: string
  }
  
  export interface Meta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }

    export interface MetaTeaching {
    total: number
    page: number
    limit: number
  }