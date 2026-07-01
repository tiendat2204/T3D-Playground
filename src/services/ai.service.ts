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
      return { data: { data: null } }
    }
    return Promise.reject(error)
  }
)

interface ApiResponse<T> {
  data: T
}

export interface TestPlan {
  summary: string
  testSuites: {
    name: string
    priority: 'high' | 'medium' | 'low'
    tags: string[]
    cases: {
      title: string
      steps: string[]
      expectedResult: string
      risk: string
      tags: string[]
    }[]
  }[]
}

export interface GenerateTestPlanInput {
  projectId: string
  url: string
  goal: string
  role?: string
  destructiveAllowed?: boolean
}

export interface GenerateCodeInput {
  testCaseId: string
  environmentId: string
}

export interface FailureAnalysis {
  rootCause: string
  confidenceScore: number
  issueType: 'product_bug' | 'test_bug' | 'environment_issue' | 'unknown'
  suggestedFix: string
  saferLocatorSuggestion?: string
  patchCode?: string
  bugReport: {
    title: string
    stepsToReproduce: string[]
    expectedResult: string
    actualResult: string
    evidence: string[]
    aiAnalysis: string
  }
}

export const aiService = {
  generatePlan: async (data: GenerateTestPlanInput): Promise<TestPlan | null> => {
    try {
      const res: AxiosResponse<ApiResponse<TestPlan>> = await apiClient.post('/ai/generate-plan', data)
      return res.data.data || null
    } catch (error) {
      console.error('aiService.generatePlan error', error)
      return null
    }
  },

  generateCode: async (data: GenerateCodeInput): Promise<string | null> => {
    try {
      const res: AxiosResponse<ApiResponse<{ code: string }>> = await apiClient.post('/ai/generate-code', data)
      return res.data.data?.code || null
    } catch (error) {
      console.error('aiService.generateCode error', error)
      return null
    }
  },

  analyzeFailure: async (data: { testRunResultId: string }): Promise<FailureAnalysis | null> => {
    try {
      const res: AxiosResponse<ApiResponse<FailureAnalysis>> = await apiClient.post('/ai/analyze-failure', data)
      return res.data.data || null
    } catch (error) {
      console.error('aiService.analyzeFailure error', error)
      return null
    }
  }
}
