import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import {
  type AIProvider,
  type GenerateTestPlanParams,
  type GenerateCodeParams,
  type AnalyzeFailureParams
} from './provider.interface'
import { type TestPlan, type FailureAnalysis } from '@/types/ai'
import { getTestPlanSystemPrompt, getCodeGenerationPrompt, getFailureAnalysisPrompt } from './prompts'

const testPlanSchema = z.object({
  summary: z.string(),
  testSuites: z.array(z.object({
    name: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    tags: z.array(z.string()),
    cases: z.array(z.object({
      title: z.string(),
      steps: z.array(z.string()),
      expectedResult: z.string(),
      risk: z.string(),
      tags: z.array(z.string())
    }))
  }))
})

const failureAnalysisSchema = z.object({
  rootCause: z.string(),
  confidenceScore: z.number(),
  issueType: z.enum(['product_bug', 'test_bug', 'environment_issue', 'unknown']),
  suggestedFix: z.string(),
  saferLocatorSuggestion: z.string().nullable(),
  patchCode: z.string().nullable(),
  bugReport: z.object({
    title: z.string(),
    stepsToReproduce: z.array(z.string()),
    expectedResult: z.string(),
    actualResult: z.string(),
    evidence: z.array(z.string()),
    aiAnalysis: z.string()
  })
})

function getApiKey(): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  if (!apiKey) {
    throw new Error(
      'GOOGLE_GENERATIVE_AI_API_KEY is not set. ' +
      'Get a key from https://aistudio.google.com/apikey ' +
      'and add it to .env file.'
    )
  }
  return apiKey
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: unknown) {
      const isRetryable = error && typeof error === 'object' && 'isRetryable' in error && (error as { isRetryable: boolean }).isRetryable
      if (!isRetryable || attempt === maxRetries) {
        throw error
      }
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 30000)
      console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private model: string

  constructor(model = 'gemini-2.5-flash') {
    this.model = model
  }

  async generateTestPlan(params: GenerateTestPlanParams): Promise<TestPlan> {
    getApiKey()
    return withRetry(async () => {
      const { object } = await generateObject({
        model: google(this.model),
        schema: testPlanSchema,
        system: getTestPlanSystemPrompt(),
        prompt: `Create a Playwright test plan for:\nURL: ${params.url}\nGoal: ${params.goal}\nRole: ${params.role || 'User'}\nDestructive actions allowed: ${params.destructiveAllowed ? 'Yes' : 'No'}`
      })
      return object as TestPlan
    })
  }

  async generatePlaywrightCode(params: GenerateCodeParams): Promise<string> {
    getApiKey()
    return withRetry(async () => {
      const prompt = getCodeGenerationPrompt(params)
      const { object } = await generateObject({
        model: google(this.model),
        schema: z.object({ code: z.string() }),
        system: 'You are a senior Playwright TypeScript engineer. Generate only valid TypeScript code.',
        prompt
      })
      return object.code
    })
  }

  async analyzeFailure(params: AnalyzeFailureParams): Promise<FailureAnalysis> {
    getApiKey()
    return withRetry(async () => {
      const prompt = getFailureAnalysisPrompt(params)
      const { object } = await generateObject({
        model: google(this.model),
        schema: failureAnalysisSchema,
        system: 'You are a QA automation debugging assistant.',
        prompt
      })
      return object as FailureAnalysis
    })
  }
}
