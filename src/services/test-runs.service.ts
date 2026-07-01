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

export interface TestRun {
  id: string
  projectId: string
  environmentId: string
  status: 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
  runType: 'smoke' | 'regression' | 'impacted' | 'manual'
  tags?: string[]
  startedAt?: string
  finishedAt?: string
  summary?: {
    total: number
    passed: number
    failed: number
    skipped: number
    error: number
  }
  createdAt: string
}

export interface CreateTestRunInput {
  projectId: string
  environmentId: string
  runType?: 'smoke' | 'regression' | 'impacted' | 'manual'
  tags?: string[]
  testCaseIds?: string[]
}

export const testRunsService = {
  list: async (params?: Record<string, string>): Promise<TestRun[]> => {
    try {
      const res: AxiosResponse<ApiResponse<TestRun[]>> = await apiClient.get('/test-runs', { params })
      return res.data.data || []
    } catch (error) {
      console.error('testRunsService.list error', error)
      return []
    }
  },

  get: async (id: string): Promise<TestRun | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestRun>> = await apiClient.get(`/test-runs/${id}`)
      return res.data.data || null
    } catch (error) {
      console.error('testRunsService.get error', error)
      return null
    }
  },

  create: async (data: CreateTestRunInput): Promise<TestRun | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestRun>> = await apiClient.post('/test-runs', data)
      return res.data.data || null
    } catch (error) {
      console.error('testRunsService.create error', error)
      return null
    }
  },

  cancel: async (id: string): Promise<TestRun | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestRun>> = await apiClient.post(`/test-runs/${id}/cancel`)
      return res.data.data || null
    } catch (error) {
      console.error('testRunsService.cancel error', error)
      return null
    }
  }
}
