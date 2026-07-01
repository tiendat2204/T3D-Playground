'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Save, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

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

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash']
const OPENAI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo']

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<AIProviderSettings>(DEFAULT_SETTINGS)
  const [showGeminiKey, setShowGeminiKey] = React.useState(false)
  const [showOpenaiKey, setShowOpenaiKey] = React.useState(false)
  const [showAnthropicKey, setShowAnthropicKey] = React.useState(false)
  const [saved, setSaved] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setSettings(JSON.parse(stored))
      } catch {
        console.error('Failed to parse settings')
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  const updateSetting = <K extends keyof AIProviderSettings>(key: K, value: AIProviderSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure AI providers and application settings</p>
      </div>

      {/* Active Provider */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Active AI Provider
          </CardTitle>
          <CardDescription>Select which AI provider to use for test generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={settings.activeProvider} onValueChange={(v) => updateSetting('activeProvider', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="anthropic">Anthropic (Coming Soon)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-none text-sm">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="text-blue-700 dark:text-blue-300">
              Active provider: <strong>{settings.activeProvider.toUpperCase()}</strong>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Gemini Settings */}
      <Card className={settings.activeProvider === 'gemini' ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Gemini</CardTitle>
              <CardDescription>Get API key from https://aistudio.google.com/apikey</CardDescription>
            </div>
            {settings.activeProvider === 'gemini' && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-none">Active</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type={showGeminiKey ? 'text' : 'password'}
                value={settings.geminiApiKey}
                onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
                placeholder="AIza..."
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowGeminiKey(!showGeminiKey)}
              >
                {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={settings.geminiModel} onValueChange={(v) => updateSetting('geminiModel', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GEMINI_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {settings.geminiApiKey && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              API key configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* OpenAI Settings */}
      <Card className={settings.activeProvider === 'openai' ? 'border-primary' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>OpenAI</CardTitle>
              <CardDescription>Get API key from https://platform.openai.com/api-keys</CardDescription>
            </div>
            {settings.activeProvider === 'openai' && (
              <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded-none">Active</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type={showOpenaiKey ? 'text' : 'password'}
                value={settings.openaiApiKey}
                onChange={(e) => updateSetting('openaiApiKey', e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={settings.openaiModel} onValueChange={(v) => updateSetting('openaiModel', v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPENAI_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {settings.openaiApiKey && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              API key configured
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="rounded-none">
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
