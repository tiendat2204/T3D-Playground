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
      return res.data.data || []
    } catch (error) {
      console.error('testCasesService.list error', error)
      return []
    }
  },

  get: async (id: string): Promise<TestCase | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.get(`/test-cases/${id}`)
      return res.data.data || null
    } catch (error) {
      console.error('testCasesService.get error', error)
      return null
    }
  },

  create: async (data: CreateTestCaseInput): Promise<TestCase | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post('/test-cases', data)
      return res.data.data || null
    } catch (error) {
      console.error('testCasesService.create error', error)
      return null
    }
  },

  update: async (id: string, data: Partial<CreateTestCaseInput>): Promise<TestCase | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.put(`/test-cases/${id}`, data)
      return res.data.data || null
    } catch (error) {
      console.error('testCasesService.update error', error)
      return null
    }
  },

  approve: async (id: string): Promise<TestCase | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post(`/test-cases/${id}/approve`)
      return res.data.data || null
    } catch (error) {
      console.error('testCasesService.approve error', error)
      return null
    }
  },

  disable: async (id: string): Promise<TestCase | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestCase>> = await apiClient.post(`/test-cases/${id}/disable`)
      return res.data.data || null
    } catch (error) {
      console.error('testCasesService.disable error', error)
      return null
    }
  }
}
