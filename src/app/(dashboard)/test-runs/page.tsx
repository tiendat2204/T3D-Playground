'use client'

import { useTestRuns } from '@/hooks/use-test-runs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function TestRunsPage() {
  const { data: testRuns, isLoading } = useTestRuns()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Test Runs</h1>
        <p className="text-gray-600">View test execution history</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : !testRuns || testRuns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Play className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No test runs yet</p>
            <p className="text-sm text-gray-400 mt-2">Create a project and run tests to see results here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {testRuns.map((run) => (
            <Card key={run.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(run.status)}
                    Test Run
                  </CardTitle>
                  <Badge variant={run.status === 'passed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
                    {run.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Type: {run.runType}</span>
                  <span>Created: {new Date(run.createdAt).toLocaleDateString()}</span>
                  {run.summary && (
                    <span>
                      Results: {run.summary.passed}/{run.summary.total} passed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
