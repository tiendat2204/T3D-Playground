'use client'

import { useState, useEffect } from 'react'

interface AIProviderSettings {
  activeProvider: string
  geminiApiKey: string
  openaiApiKey: string
  anthropicApiKey: string
  geminiModel: string
  openaiModel: string
}

const STORAGE_KEY = 'ai-regression-worker-settings'

const DEFAULT_SETTINGS: AIProviderSettings = {
  activeProvider: 'gemini',
  geminiApiKey: '',
  openaiApiKey: '',
  anthropicApiKey: '',
  geminiModel: 'gemini-2.5-flash',
  openaiModel: 'gpt-4o'
}

export function useAISettings() {
  const [settings, setSettings] = useState<AIProviderSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        console.error('Failed to parse AI settings')
      }
    }
  }, [])

  const updateSettings = (newSettings: Partial<AIProviderSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const getApiKey = (provider?: string): string => {
    const p = provider || settings.activeProvider
    switch (p) {
      case 'gemini':
        return settings.geminiApiKey
      case 'openai':
        return settings.openaiApiKey
      case 'anthropic':
        return settings.anthropicApiKey
      default:
        return ''
    }
  }

  const getModel = (provider?: string): string => {
    const p = provider || settings.activeProvider
    switch (p) {
      case 'gemini':
        return settings.geminiModel
      case 'openai':
        return settings.openaiModel
      default:
        return ''
    }
  }

  return { settings, updateSettings, getApiKey, getModel }
}
