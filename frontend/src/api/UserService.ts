import BaseService from './BaseService.ts'
import type { IUser } from '../types/user'
import type { ICommonResponse } from '../types/index'

class UserService extends BaseService {
  private baseUrl = 'http://14.225.217.42:5000/api'

  getProfile(): Promise<ICommonResponse<IUser>> {
    return this.get<ICommonResponse<IUser>>(`${this.baseUrl}/profile`)
  }

  getUsers(): Promise<ICommonResponse<IUser[]>> {
    return this.get<ICommonResponse<IUser[]>>(this.baseUrl)
  }
}

export default new UserService()