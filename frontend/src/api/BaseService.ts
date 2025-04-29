/* eslint-disable no-useless-catch */
import axiosInstance from './axiosInstance'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

class BaseService {
  protected async request<T>(
    method: string,
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance({ method, url, data, ...config })
      return response.data
    } catch (error) {
      throw error
    }
  }

  protected get<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('GET', url, undefined, config)
  }

  protected post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>('POST', url, data, config)
  }

  protected put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.request<T>('PUT', url, data, config)
  }

  protected delete<T>(url: string, config?: AxiosRequestConfig) {
    return this.request<T>('DELETE', url, undefined, config)
  }
}

export default BaseService
