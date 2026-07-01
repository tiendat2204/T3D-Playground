'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure AI providers and application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Provider Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Configure your AI providers (OpenAI, Anthropic, Gemini) in the .env file.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-md font-mono text-sm">
            <p>OPENAI_API_KEY=sk-...</p>
            <p>ANTHROPIC_API_KEY=sk-ant-...</p>
            <p>GEMINI_API_KEY=...</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            PostgreSQL and Redis are required for full functionality.
          </p>
          <div className="mt-4 p-4 bg-gray-100 rounded-md font-mono text-sm">
            <p>DATABASE_URL=postgresql://...</p>
            <p>REDIS_URL=redis://localhost:6379</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
