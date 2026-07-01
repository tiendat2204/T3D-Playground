import { type AIProvider } from './provider.interface'
import { type AIProviderConfig } from '@/types/ai'
import { OpenAIProvider } from './openai.provider'
import { GeminiProvider } from './gemini.provider'
import { aiCache } from './cache'

let defaultProvider: AIProvider | null = null

function detectProvider(): AIProvider {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new GeminiProvider()
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider()
  }
  // Default to Gemini (will fail at runtime if not configured)
  return new GeminiProvider()
}

export function getAIProvider(config?: AIProviderConfig): AIProvider {
  const providerType = config?.type
  const model = config?.model

  if (providerType) {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider(model)
      case 'gemini':
        return new GeminiProvider(model)
      case 'anthropic':
        throw new Error('Anthropic provider not yet implemented')
      case 'local':
        throw new Error('Local provider not yet implemented')
    }
  }

  return detectProvider()
}

export function setDefaultProvider(provider: AIProvider) {
  defaultProvider = provider
}

export function getDefaultProvider(): AIProvider {
  if (!defaultProvider) {
    defaultProvider = detectProvider()
  }
  return defaultProvider
}

export { aiCache }
