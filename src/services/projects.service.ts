import axios from 'axios'
import type { AxiosResponse } from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

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
      return res.data.data
    } catch (error) {
      console.error('projectsService.list error', error)
      throw error
    }
  },

  get: async (id: string): Promise<Project> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.get(`/projects/${id}`)
      return res.data.data
    } catch (error) {
      console.error('projectsService.get error', error)
      throw error
    }
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.post('/projects', data)
      return res.data.data
    } catch (error) {
      console.error('projectsService.create error', error)
      throw error
    }
  },

  update: async (id: string, data: Partial<CreateProjectInput>): Promise<Project> => {
    try {
      const res: AxiosResponse<ApiResponse<Project>> = await apiClient.put(`/projects/${id}`, data)
      return res.data.data
    } catch (error) {
      console.error('projectsService.update error', error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/projects/${id}`)
    } catch (error) {
      console.error('projectsService.delete error', error)
      throw error
    }
  }
}
