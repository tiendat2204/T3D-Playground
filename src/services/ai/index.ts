import { type AIProvider } from './provider.interface'
import { type AIProviderConfig } from '@/types/ai'
import { OpenAIProvider } from './openai.provider'
import { aiCache } from './cache'

let defaultProvider: AIProvider | null = null

export function getAIProvider(config?: AIProviderConfig): AIProvider {
  const providerType = config?.type || 'openai'
  const model = config?.model

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(model)
    case 'anthropic':
      // TODO: Implement Anthropic provider
      throw new Error('Anthropic provider not yet implemented')
    case 'gemini':
      // TODO: Implement Gemini provider
      throw new Error('Gemini provider not yet implemented')
    case 'local':
      // TODO: Implement Local provider
      throw new Error('Local provider not yet implemented')
    default:
      return new OpenAIProvider(model)
  }
}

export function setDefaultProvider(provider: AIProvider) {
  defaultProvider = provider
}

export function getDefaultProvider(): AIProvider {
  if (!defaultProvider) {
    defaultProvider = new OpenAIProvider()
  }
  return defaultProvider
}

export { aiCache }
