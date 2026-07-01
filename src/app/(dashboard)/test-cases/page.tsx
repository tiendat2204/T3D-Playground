'use client'

import { useTestCases } from '@/hooks/use-test-cases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestTube, Plus } from 'lucide-react'
import Link from 'next/link'

export default function TestCasesPage() {
  const { data: testCases, isLoading } = useTestCases()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Test Cases</h1>
          <p className="text-gray-600">Manage your test cases</p>
        </div>
        <Link href="/ai-generate">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Generate Test Case
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !testCases || testCases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TestTube className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No test cases yet</p>
            <p className="text-sm text-gray-400 mt-2">Use AI Generate to create your first test case</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testCases.map((tc) => (
            <Card key={tc.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tc.title}</CardTitle>
                  <Badge variant={tc.status === 'approved' ? 'default' : tc.status === 'draft' ? 'secondary' : 'outline'}>
                    {tc.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{tc.description || 'No description'}</p>
                <div className="flex gap-2 mt-3">
                  {tc.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
