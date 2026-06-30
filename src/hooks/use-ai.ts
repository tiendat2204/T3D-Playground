'use client'

import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useGenerateTestPlan() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.generatePlan(data)
  })
}

export function useGenerateCode() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.generateCode(data)
  })
}

export function useAnalyzeFailure() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.analyzeFailure(data)
  })
}
