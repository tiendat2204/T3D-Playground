'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { testCasesService, type TestCase, type CreateTestCaseInput } from '@/services/test-cases.service'

export function useTestCases(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testCases', filters],
    queryFn: () => testCasesService.list(filters)
  })
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ['testCases', id],
    queryFn: () => testCasesService.get(id),
    enabled: !!id
  })
}

export function useCreateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTestCaseInput) => testCasesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTestCaseInput> }) =>
      testCasesService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
      queryClient.invalidateQueries({ queryKey: ['testCases', variables.id] })
    }
  })
}

export function useApproveTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => testCasesService.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useDisableTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => testCasesService.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}
