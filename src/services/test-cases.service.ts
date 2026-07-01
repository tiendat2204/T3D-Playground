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
}

export interface TestCase {
  id: string
  projectId: string
  moduleId?: string
  title: string
  description?: string
  goal?: string
  tags: string[]
  priority: 'high' | 'medium' | 'low'
  status: 'draft' | 'approved' | 'disabled'
  generatedCode?: string
  createdByAi: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTestCaseInput {
  projectId: string
  moduleId?: string
  title: string
  description?: string
  goal?: string
  tags?: string[]
  priority?: 'high' | 'medium' | 'low'
  generatedCode?: string
  createdByAi?: boolean
}

export const testCasesService = {
  list: async (params?: Record<string, string>): Promise<TestCase[]> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase[]>> = await apiClient.get('/test-cases', { params })
      return res.data.data
    } catch (error) {
      console.error('testCasesService.list error', error)
      throw error
    }
  },

  get: async (id: string): Promise<TestCase> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.get(`/test-cases/${id}`)
      return res.data.data
    } catch (error) {
      console.error('testCasesService.get error', error)
      throw error
    }
  },

  create: async (data: CreateTestCaseInput): Promise<TestCase> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post('/test-cases', data)
      return res.data.data
    } catch (error) {
      console.error('testCasesService.create error', error)
      throw error
    }
  },

  update: async (id: string, data: Partial<CreateTestCaseInput>): Promise<TestCase> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.put(`/test-cases/${id}`, data)
      return res.data.data
    } catch (error) {
      console.error('testCasesService.update error', error)
      throw error
    }
  },

  approve: async (id: string): Promise<TestCase> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post(`/test-cases/${id}/approve`)
      return res.data.data
    } catch (error) {
      console.error('testCasesService.approve error', error)
      throw error
    }
  },

  disable: async (id: string): Promise<TestCase> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post(`/test-cases/${id}/disable`)
      return res.data.data
    } catch (error) {
      console.error('testCasesService.disable error', error)
      throw error
    }
  }
}
