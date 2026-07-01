'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api-client'

export function useBugReports(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['bugReports', filters],
    queryFn: () => api.bugReports.list(filters)
  })
}

export function useBugReport(id: string) {
  return useQuery({
    queryKey: ['bugReports', id],
    queryFn: () => api.bugReports.get(id),
    enabled: !!id
  })
}

export function useCreateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.bugReports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
    }
  })
}

export function useUpdateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.bugReports.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
      queryClient.invalidateQueries({ queryKey: ['bugReports', variables.id] })
    }
  })
}
