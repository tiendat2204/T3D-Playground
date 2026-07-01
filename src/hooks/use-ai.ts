'use client'

import { useMutation } from '@tanstack/react-query'
import { aiService, type GenerateTestPlanInput, type GenerateCodeInput } from '@/services/ai.service'

export function useGenerateTestPlan() {
  return useMutation({
    mutationFn: (data: GenerateTestPlanInput) => aiService.generatePlan(data)
  })
}

export function useGenerateCode() {
  return useMutation({
    mutationFn: (data: GenerateCodeInput) => aiService.generateCode(data)
  })
}

export function useAnalyzeFailure() {
  return useMutation({
    mutationFn: (data: { testRunResultId: string }) => aiService.analyzeFailure(data)
  })
}
