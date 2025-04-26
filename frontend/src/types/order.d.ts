  export interface responseOrders {
    data: IOrder[]
    meta: Meta
  }
  export interface IOrder {
    id: number
    createdAt: string
    sessionId: string
    status: string
    courses: Course[]
    user: User
    totalPrice: number
  }
  
  export interface User {
    id: number
    email: string
    userName: string
    avatar: string
  }

  export interface Meta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
  export interface Course {
    id: number
    name: string
    price: string
  }

  export interface orderRespone {
    id: number
    userId: number
    createdAt: string
    sessionId: string
    status: string
    courseIds: string[]
    user: User
    courses: MCourse[]
    totalPrice: number
  }

  export interface MCourse {
    id: number
    name: string
    price: string
    description: string
    image: string
    category: Category
  }
  
  export interface Category {
    id: number
    name: string
    description: string
  }