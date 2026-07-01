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

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private model: string

  constructor(model = 'gemini-2.5-flash') {
    this.model = model
  }

  async generateTestPlan(params: GenerateTestPlanParams): Promise<TestPlan> {
    const apiKey = getApiKey()
    const { object } = await generateObject({
      model: google(this.model, { apiKey }),
      schema: testPlanSchema,
      system: getTestPlanSystemPrompt(),
      prompt: `Create a Playwright test plan for:\nURL: ${params.url}\nGoal: ${params.goal}\nRole: ${params.role || 'User'}\nDestructive actions allowed: ${params.destructiveAllowed ? 'Yes' : 'No'}`
    })
    return object as TestPlan
  }

  async generatePlaywrightCode(params: GenerateCodeParams): Promise<string> {
    const apiKey = getApiKey()
    const prompt = getCodeGenerationPrompt(params)
    const { object } = await generateObject({
      model: google(this.model, { apiKey }),
      schema: z.object({ code: z.string() }),
      system: 'You are a senior Playwright TypeScript engineer. Generate only valid TypeScript code.',
      prompt
    })
    return object.code
  }

  async analyzeFailure(params: AnalyzeFailureParams): Promise<FailureAnalysis> {
    const apiKey = getApiKey()
    const prompt = getFailureAnalysisPrompt(params)
    const { object } = await generateObject({
      model: google(this.model, { apiKey }),
      schema: failureAnalysisSchema,
      system: 'You are a QA automation debugging assistant.',
      prompt
    })
    return object as FailureAnalysis
  }
}
