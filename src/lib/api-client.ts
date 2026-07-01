import axios, { AxiosError, AxiosInstance } from 'axios'
import { API_BASE_URL } from './constants'

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  response => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = response.data
    if (body && typeof body === 'object' && 'data' in body) {
      return body.data
    }
    return body
  },
  (error: AxiosError<{ error: string }>) => {
    const message = error.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)

interface ApiNamespace {
  list: (params?: Record<string, string>) => Promise<unknown>
  get: (id: string) => Promise<unknown>
  create: (data: unknown) => Promise<unknown>
  update: (id: string, data: unknown) => Promise<unknown>
  delete: (id: string) => Promise<unknown>
}

interface Api {
  projects: ApiNamespace
  environments: {
    list: (projectId: string) => Promise<unknown>
    create: (projectId: string, data: unknown) => Promise<unknown>
    update: (id: string, data: unknown) => Promise<unknown>
    delete: (id: string) => Promise<unknown>
  }
  modules: {
    list: (projectId: string) => Promise<unknown>
    create: (projectId: string, data: unknown) => Promise<unknown>
  }
  testCases: Pick<ApiNamespace, 'list' | 'get' | 'create' | 'update'> & {
    approve: (id: string) => Promise<unknown>
    disable: (id: string) => Promise<unknown>
  }
  testRuns: Pick<ApiNamespace, 'list' | 'get' | 'create'> & {
    cancel: (id: string) => Promise<unknown>
  }
  ai: {
    generatePlan: (data: unknown) => Promise<unknown>
    generateCode: (data: unknown) => Promise<unknown>
    analyzeFailure: (data: unknown) => Promise<unknown>
    suggestPatch: (data: unknown) => Promise<unknown>
  }
  bugReports: Pick<ApiNamespace, 'list' | 'get' | 'create' | 'update'>
}

export const api: Api = {
  projects: {
    list: () => apiClient.get('/projects'),
    get: (id: string) => apiClient.get(`/projects/${id}`),
    create: (data: unknown) => apiClient.post('/projects', data),
    update: (id: string, data: unknown) => apiClient.put(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`)
  },
  environments: {
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/environments`),
    create: (projectId: string, data: unknown) => apiClient.post(`/projects/${projectId}/environments`, data),
    update: (id: string, data: unknown) => apiClient.put(`/environments/${id}`, data),
    delete: (id: string) => apiClient.delete(`/environments/${id}`)
  },
  modules: {
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/modules`),
    create: (projectId: string, data: unknown) => apiClient.post(`/projects/${projectId}/modules`, data)
  },
  testCases: {
    list: (params?: Record<string, string>) => apiClient.get('/test-cases', { params }),
    get: (id: string) => apiClient.get(`/test-cases/${id}`),
    create: (data: unknown) => apiClient.post('/test-cases', data),
    update: (id: string, data: unknown) => apiClient.put(`/test-cases/${id}`, data),
    approve: (id: string) => apiClient.post(`/test-cases/${id}/approve`),
    disable: (id: string) => apiClient.post(`/test-cases/${id}/disable`)
  },
  testRuns: {
    list: (params?: Record<string, string>) => apiClient.get('/test-runs', { params }),
    get: (id: string) => apiClient.get(`/test-runs/${id}`),
    create: (data: unknown) => apiClient.post('/test-runs', data),
    cancel: (id: string) => apiClient.post(`/test-runs/${id}/cancel`)
  },
  ai: {
    generatePlan: (data: unknown) => apiClient.post('/ai/generate-plan', data),
    generateCode: (data: unknown) => apiClient.post('/ai/generate-code', data),
    analyzeFailure: (data: unknown) => apiClient.post('/ai/analyze-failure', data),
    suggestPatch: (data: unknown) => apiClient.post('/ai/suggest-patch', data)
  },
  bugReports: {
    list: (params?: Record<string, string>) => apiClient.get('/bug-reports', { params }),
    get: (id: string) => apiClient.get(`/bug-reports/${id}`),
    create: (data: unknown) => apiClient.post('/bug-reports', data),
    update: (id: string, data: unknown) => apiClient.put(`/bug-reports/${id}`, data)
  }
}

export default apiClient
