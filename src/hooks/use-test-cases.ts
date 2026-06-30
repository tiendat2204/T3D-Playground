'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useTestCases(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testCases', filters],
    queryFn: () => api.testCases.list(filters)
  })
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ['testCases', id],
    queryFn: () => api.testCases.get(id),
    enabled: !!id
  })
}

export function useCreateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.testCases.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.testCases.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
      queryClient.invalidateQueries({ queryKey: ['testCases', variables.id] })
    }
  })
}

export function useApproveTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testCases.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useDisableTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testCases.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}
