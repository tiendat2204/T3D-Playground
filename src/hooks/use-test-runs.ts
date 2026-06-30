'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useTestRuns(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testRuns', filters],
    queryFn: () => api.testRuns.list(filters)
  })
}

export function useTestRun(id: string) {
  return useQuery({
    queryKey: ['testRuns', id],
    queryFn: () => api.testRuns.get(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'queued' ? 2000 : false
    }
  })
}

export function useCreateTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.testRuns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}

export function useCancelTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testRuns.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}
