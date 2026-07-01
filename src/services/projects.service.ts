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
    // Return empty data on connection errors
    if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
      return { data: { data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } } }
    }
    return Promise.reject(error)
  }
)

interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface Project {
  id: string
  name: string
  baseUrl: string
  description?: string
  authConfig?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  name: string
  baseUrl: string
  description?: string
  authConfig?: Record<string, unknown>
}

export const projectsService = {
  list: async (): Promise<Project[]> => {
    try {
      const res: AxiosResponse<ApiResponse<Project[]>> = await apiClient.get('/projects')
      return res.data.data || []
    } catch (error) {
      console.error('projectsService.list error', error)
      return []
    }
  },

  get: async (id: string): Promise<Project | null> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.get(`/projects/${id}`)
      return res.data.data || null
    } catch (error) {
      console.error('projectsService.get error', error)
      return null
    }
  },

  create: async (data: CreateProjectInput): Promise<Project | null> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.post('/projects', data)
      return res.data.data || null
    } catch (error) {
      console.error('projectsService.create error', error)
      return null
    }
  },

  update: async (id: string, data: Partial<CreateProjectInput>): Promise<Project | null> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.put(`/projects/${id}`, data)
      return res.data.data || null
    } catch (error) {
      console.error('projectsService.update error', error)
      return null
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/projects/${id}`)
      return true
    } catch (error) {
      console.error('projectsService.delete error', error)
      return false
    }
  }
}
