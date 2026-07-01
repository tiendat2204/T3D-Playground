'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bugReportsService, type BugReport, type CreateBugReportInput } from '@/services/bug-reports.service'

export function useBugReports(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['bugReports', filters],
    queryFn: () => bugReportsService.list(filters)
  })
}

export function useBugReport(id: string) {
  return useQuery({
    queryKey: ['bugReports', id],
    queryFn: () => bugReportsService.get(id),
    enabled: !!id
  })
}

export function useCreateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateBugReportInput) => bugReportsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
    }
  })
}

export function useUpdateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BugReport> }) =>
      bugReportsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
      queryClient.invalidateQueries({ queryKey: ['bugReports', variables.id] })
    }
  })
}
