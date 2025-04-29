import type { ICommonResponse } from '@/types'
import BaseService from './BaseService'
import type { ICourse } from '../types/course'

class CourseService extends BaseService {
  private baseUrl = '/courses'

  getPopularCourse(): Promise<ICommonResponse<ICourse>> {
    return this.get<ICommonResponse<ICourse>>(this.baseUrl)
  }
}

export default new CourseService()
