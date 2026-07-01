'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb } from 'lucide-react'

export default function AISuggestionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Suggestions</h1>
        <p className="text-gray-600">Review AI-generated patches and fixes</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Lightbulb className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No AI suggestions yet</p>
          <p className="text-sm text-gray-400 mt-2">
            AI suggestions appear here when tests fail and the AI proposes fixes
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
