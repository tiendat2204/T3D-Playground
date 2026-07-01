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

export interface BugReport {
  id: string
  projectId: string
  testRunResultId?: string
  title: string
  module?: string
  environment?: string
  stepsToReproduce: string[]
  expectedResult: string
  actualResult: string
  evidence?: {
    screenshotUrl?: string
    videoUrl?: string
    traceUrl?: string
    consoleLogs?: string[]
  }
  aiAnalysis?: string
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  createdAt: string
  updatedAt: string
}

export interface CreateBugReportInput {
  projectId: string
  testRunResultId?: string
  title: string
  module?: string
  environment?: string
  stepsToReproduce: string[]
  expectedResult: string
  actualResult: string
  evidence?: {
    screenshotUrl?: string
    videoUrl?: string
    traceUrl?: string
    consoleLogs?: string[]
  }
  aiAnalysis?: string
}

export const bugReportsService = {
  list: async (params?: Record<string, string>): Promise<BugReport[]> => {
    try {
      const res: AxiosResponse<ApiResponse<BugReport[]>> = await apiClient.get('/bug-reports', { params })
      return res.data.data || []
    } catch (error) {
      console.error('bugReportsService.list error', error)
      return []
    }
  },

  get: async (id: string): Promise<BugReport | null> => {
    try {
      const res: AxiosResponse<ApiResponse<BugReport>> = await apiClient.get(`/bug-reports/${id}`)
      return res.data.data || null
    } catch (error) {
      console.error('bugReportsService.get error', error)
      return null
    }
  },

  create: async (data: CreateBugReportInput): Promise<BugReport | null> => {
    try {
      const res: AxiosResponse<ApiResponse<BugReport>> = await apiClient.post('/bug-reports', data)
      return res.data.data || null
    } catch (error) {
      console.error('bugReportsService.create error', error)
      return null
    }
  },

  update: async (id: string, data: Partial<BugReport>): Promise<BugReport | null> => {
    try {
      const res: AxiosResponse<ApiResponse<BugReport>> = await apiClient.put(`/bug-reports/${id}`, data)
      return res.data.data || null
    } catch (error) {
      console.error('bugReportsService.update error', error)
      return null
    }
  }
}
