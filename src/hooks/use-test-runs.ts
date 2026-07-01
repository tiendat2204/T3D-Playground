'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testRunsService, type TestRun, type CreateTestRunInput } from '@/services/test-runs.service'

export function useTestRuns(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testRuns', filters],
    queryFn: () => testRunsService.list(filters)
  })
}

export function useTestRun(id: string) {
  return useQuery({
    queryKey: ['testRuns', id],
    queryFn: () => testRunsService.get(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data as TestRun | undefined
      const status = data?.status
      return status === 'running' || status === 'queued' ? 2000 : false
    }
  })
}

export function useCreateTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTestRunInput) => testRunsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}

export function useCancelTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => testRunsService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}
