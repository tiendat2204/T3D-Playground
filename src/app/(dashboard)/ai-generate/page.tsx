'use client'

import { useState } from 'react'
import { ChatAI } from '@/components/ai/chat-ai'
import { GenerationWizard } from '@/components/ai/generation-wizard'
import { type TestPlan } from '@/services/ai.service'
import { Button } from '@/components/ui/button'
import { Bot, Sparkles } from 'lucide-react'

export default function AIGeneratePage() {
  const [mode, setMode] = useState<'chat' | 'wizard'>('chat')
  const [generatedPlan, setGeneratedPlan] = useState<TestPlan | null>(null)

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">AI Test Generation</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={mode === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('chat')}
          >
            <Bot className="w-4 h-4 mr-2" />
            Chat Mode
          </Button>
          <Button
            variant={mode === 'wizard' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('wizard')}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Wizard Mode
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {mode === 'chat' ? (
          <ChatAI onPlanGenerated={setGeneratedPlan} />
        ) : (
          <div className="p-6 overflow-y-auto h-full">
            <GenerationWizard />
          </div>
        )}
      </div>
    </div>
  )
}
