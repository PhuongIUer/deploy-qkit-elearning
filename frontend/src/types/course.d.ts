  
  export interface ICourse {
    id: number
    name: string
    price: number
    description: string
    courseLevel: CourseLevel
    totalLessons: number
    totalChapters: number
    totalStudents: number
    discountPrice: number
    discountTimeRemaining: string
    discountPercentage: number
    image?: string
    slug: string
    category: Category
    createdAt: string
    teachings: Teaching[]
    averageRating: number
    ratingCount: number
    totalDuration: number
    features: Feature[]
  }
  export interface ICourseTeaching {
    id: number
    courseLevel: string
    name: string
    price: string
    description: string
    totalLessons: number
    totalChapters: number
    totalStudents: number
    image?: string
    slug: string
    discountPrice: string
    discountPercentage: number
    discountTimeRemaining: string
    createdAt: string
    priceId: string
    deactivatedAt: string
    totalDuration: number
    category: Category
    teachings: Teaching[]
    features: Feature[]
  }
  
  export enum CourseLevel {
    Beginner = 'BEGINNER',
    Intermediate = 'INTERMEDIATE',
    Advanced = 'ADVANCED',
  }
  export interface Category {
    id: number
    name: string
    description: string
  }
  
  export interface Teaching {
    userId: number
    userName: string
    avatar: string
  }
  
  export interface Meta {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }

  export interface Feature {
    id: number
    name: string
  }
  export interface averageRating {
    average: number
    count: number
  }