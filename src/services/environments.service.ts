import axios from 'axios'
import type { AxiosResponse } from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      return { data: { data: [] } }
    }
    return Promise.reject(error)
  }
)

interface ApiResponse<T> {
  data: T
}

export interface Environment {
  id: string
  projectId: string
  name: string
  baseUrl: string
  variables?: Record<string, string>
  createdAt: string
  updatedAt: string
}

export interface CreateEnvironmentInput {
  name: string
  baseUrl: string
  variables?: Record<string, string>
}

export const environmentsService = {
  list: async (projectId: string): Promise<Environment[]> => {
    try {
      const res: AxiosResponse<ApiResponse<Environment[]>> = await apiClient.get(`/projects/${projectId}/environments`)
      return res.data.data || []
    } catch (error) {
      console.error('environmentsService.list error', error)
      return []
    }
  },

  create: async (projectId: string, data: CreateEnvironmentInput): Promise<Environment | null> => {
    try {
      const res: AxiosResponse<ApiResponse<Environment>> = await apiClient.post(`/projects/${projectId}/environments`, data)
      return res.data.data || null
    } catch (error) {
      console.error('environmentsService.create error', error)
      return null
    }
  },

  update: async (id: string, data: Partial<CreateEnvironmentInput>): Promise<Environment | null> => {
    try {
      const res: AxiosResponse<ApiResponse<Environment>> = await apiClient.put(`/environments/${id}`, data)
      return res.data.data || null
    } catch (error) {
      console.error('environmentsService.update error', error)
      return null
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/environments/${id}`)
      return true
    } catch (error) {
      console.error('environmentsService.delete error', error)
      return false
    }
  }
}
